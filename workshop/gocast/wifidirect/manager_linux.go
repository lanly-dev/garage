//go:build linux

package wifidirect

import (
	"fmt"
	"log"
	"os/exec"
	"strings"
	"time"

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

	// Configure device as Miracast sink (receiver)
	cmd = exec.Command("wpa_cli", "wfd_subelem_set", "0", "000600101c4400c8")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] WFD subelements configuration failed: %v", err)
		return fmt.Errorf("failed to configure WFD subelements: %v", err)
	}
	log.Println("[Linux] Successfully configured WFD subelements as sink")

	// Enable WiFi Display
	cmd = exec.Command("wpa_cli", "set", "wifi_display", "1")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] WiFi Display enable failed: %v", err)
		return fmt.Errorf("failed to enable WiFi Display: %v", err)
	}
	log.Println("[Linux] WiFi Display enabled successfully")

	// Start P2P device discovery as sink with persistent group
	cmd = exec.Command("wpa_cli", "p2p_group_add", "persistent", "freq=5", "ht40")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] P2P group creation failed: %v", err)
		return fmt.Errorf("failed to create P2P group: %v", err)
	}
	log.Println("[Linux] P2P group created successfully as sink")

	// Enable P2P device discovery
	cmd = exec.Command("wpa_cli", "p2p_find", "type=progressive")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] P2P discovery start failed: %v", err)
		return fmt.Errorf("failed to start P2P discovery: %v", err)
	}
	log.Println("[Linux] P2P discovery started successfully")

	// Start goroutine to monitor for new devices
	go m.monitorDevices()
	log.Println("[Linux] Started device monitoring")

	return nil
}

// monitorDevices continuously monitors for incoming Miracast connections and signal status
func (m *Manager) monitorDevices() {
	log.Println("[Linux] Device monitoring started")
	processedMACs := make(map[string]bool)

	// Verify P2P and WFD configuration
	cmd := exec.Command("wpa_cli", "status")
	output, err := cmd.Output()
	if err == nil {
		log.Printf("[Linux] Initial P2P Configuration:\n%s", string(output))
	}

	cmd = exec.Command("wpa_cli", "p2p_find")
	if err := cmd.Run(); err != nil {
		log.Printf("[Linux] Failed to start P2P discovery: %v", err)
	} else {
		log.Println("[Linux] P2P discovery started successfully")
	}

	for m.isScanning {
		// Monitor P2P group and signal status
		cmd = exec.Command("wpa_cli", "status")
		output, err = cmd.Output()
		if err != nil {
			log.Printf("[Linux] Error checking P2P status: %v", err)
			continue
		}

		// Check if we're actually advertising
		if !strings.Contains(string(output), "p2p_state=ENABLED") {
			log.Println("[Linux] Warning: P2P is not enabled, attempting to re-enable")
			// Reconfigure WFD settings
			cmd = exec.Command("wpa_cli", "wfd_subelem_set", "0", "000600101c4400c8")
			cmd.Run()
			// Re-enable WiFi Display
			cmd = exec.Command("wpa_cli", "set", "wifi_display", "1")
			cmd.Run()
			// Recreate persistent P2P group
			cmd = exec.Command("wpa_cli", "p2p_group_add", "persistent", "freq=5", "ht40")
			cmd.Run()
			// Restart P2P discovery
			cmd = exec.Command("wpa_cli", "p2p_find", "type=progressive")
			cmd.Run()
		}

		// Get P2P network information
		cmd = exec.Command("wpa_cli", "list_network")
		networkInfo, err := cmd.Output()
		if err == nil {
			log.Printf("[Linux] Current P2P Networks:\n%s", string(networkInfo))
		}

		// Get group interface status
		cmd = exec.Command("wpa_cli", "interface")
		interfaceInfo, err := cmd.Output()
		if err == nil {
			log.Printf("[Linux] P2P Interface Status:\n%s", string(interfaceInfo))
		}

		// Check WFD status
		cmd = exec.Command("wpa_cli", "wfd_subelem_get", "0")
		wfdInfo, _ := cmd.Output()
		log.Printf("[Linux] WFD Subelement Status: %s", string(wfdInfo))

		// Parse status output to collect peer information
		lines := strings.Split(string(output), "\n")
		peerInfo := make(map[string]string)
		var currentMAC string

		for _, line := range lines {
			if line == "" {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) != 2 {
				continue
			}

			key, value := parts[0], parts[1]
			if key == "p2p_device_address" || key == "address" {
				currentMAC = value
				peerInfo[key] = value
			} else if currentMAC != "" {
				peerInfo[key] = value
			}
		}

		// Process collected peer information
		if currentMAC != "" && !processedMACs[currentMAC] {
			cmd = exec.Command("wpa_cli", "p2p_peer", currentMAC)
			details, err := cmd.Output()
			if err == nil {
				device := parseDeviceInfo(string(details))
				if device != nil {
					log.Printf("[Linux] Found new device: %s (MAC: %s)", device.DeviceName, device.MAC)
					m.deviceLock.Lock()
					m.devices[device.MAC] = *device
					m.deviceLock.Unlock()
					processedMACs[currentMAC] = true
				}
			}
		}

		// Sleep to avoid excessive CPU usage
		time.Sleep(2 * time.Second)
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
