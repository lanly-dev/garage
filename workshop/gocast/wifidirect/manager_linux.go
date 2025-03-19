//go:build linux

package wifidirect

import (
	"fmt"
	"log"
	"os/exec"
	"strings"

	"github.com/yourusername/gocast/models"
)

// StartDiscovery begins advertising this device as a Miracast receiver on Linux
func (m *Manager) startPlatformDiscovery() error {
	log.Println("[Linux] Starting WiFi Direct platform discovery")
	// Check if wpa_supplicant is installed and running
	cmd := exec.Command("pidof", "wpa_supplicant")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] wpa_supplicant check failed: %v", err)
		return fmt.Errorf("wpa_supplicant is not running: %v", err)
	}
	log.Println("[Linux] wpa_supplicant is running")

	// Configure device as Miracast receiver
	cmd = exec.Command("wpa_cli", "wfd_subelem_set", "0", "000600111c4400c8")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] WFD subelements configuration failed: %v", err)
		return fmt.Errorf("failed to configure WFD subelements: %v", err)
	}
	log.Println("[Linux] Successfully configured WFD subelements")

	// Enable WiFi Display
	cmd = exec.Command("wpa_cli", "set", "wifi_display", "1")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] WiFi Display enable failed: %v", err)
		return fmt.Errorf("failed to enable WiFi Display: %v", err)
	}
	log.Println("[Linux] WiFi Display enabled successfully")

	// Start P2P device discovery and advertisement
	cmd = exec.Command("wpa_cli", "p2p_group_add")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] P2P group creation failed: %v", err)
		return fmt.Errorf("failed to create P2P group: %v", err)
	}
	log.Println("[Linux] P2P group created successfully")

	// Start goroutine to monitor for new devices
	go m.monitorDevices()
	log.Println("[Linux] Started device monitoring")

	return nil
}

// monitorDevices continuously monitors for incoming Miracast connections
func (m *Manager) monitorDevices() {
	log.Println("[Linux] Device monitoring started")
	for m.isScanning {
		// Monitor P2P group status
		cmd := exec.Command("wpa_cli", "status")
		output, err := cmd.Output()
		if err != nil {
			log.Printf("[Linux] Error checking P2P status: %v", err)
			continue
		}
		log.Println("[Linux] Successfully retrieved P2P status")

		peers := strings.Split(string(output), "\n")
		for _, peer := range peers {
			if peer == "" {
				continue
			}

			log.Printf("[Linux] Processing peer: %s", peer)
			// Get peer details
			cmd = exec.Command("wpa_cli", "p2p_peer", peer)
			details, err := cmd.Output()
			if err != nil {
				log.Printf("[Linux] Failed to get details for peer %s: %v", peer, err)
				continue
			}

			// Parse peer details and update devices map
			device := parseDeviceInfo(string(details))
			if device != nil {
				log.Printf("[Linux] Found device: %s (MAC: %s)", device.DeviceName, device.MAC)
				m.deviceLock.Lock()
				m.devices[device.MAC] = *device
				m.deviceLock.Unlock()
			}
		}
	}
	log.Println("[Linux] Device monitoring stopped")
}

// parseDeviceInfo parses the wpa_cli output into DeviceInfo
func parseDeviceInfo(details string) *models.DeviceInfo {
	lines := strings.Split(details, "\n")
	device := &models.DeviceInfo{}

	for _, line := range lines {
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		switch parts[0] {
		case "device_name":
			device.DeviceName = parts[1]
		case "p2p_device_addr":
			device.MAC = parts[1]
		}
	}

	if device.MAC == "" {
		return nil
	}

	return device
}

// connectToPlatformDevice implements Linux-specific device connection
func (m *Manager) connectToPlatformDevice(mac string) error {
	// Form P2P group using wpa_cli
	cmd := exec.Command("wpa_cli", "p2p_connect", mac, "pbc")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] Connection failed to device %s: %v", mac, err)
		return fmt.Errorf("failed to connect to device: %v", err)
	}
	log.Printf("[Linux] Successfully connected to device %s", mac)
	return nil
}

// disconnectPlatformDevice implements Linux-specific device disconnection
func (m *Manager) disconnectPlatformDevice(mac string) error {
	log.Printf("[Linux] Attempting to disconnect device with MAC: %s", mac)
	// Remove P2P group using wpa_cli
	cmd := exec.Command("wpa_cli", "p2p_group_remove", mac)
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] Failed to disconnect device %s: %v", mac, err)
		return fmt.Errorf("failed to disconnect device: %v", err)
	}
	log.Printf("[Linux] Successfully disconnected from device %s", mac)
	return nil
}
