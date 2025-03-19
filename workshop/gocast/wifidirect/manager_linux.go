//go:build linux

package wifidirect

import (
	"fmt"
	"log"
	"os/exec"
	"strings"

	"github.com/yourusername/gocast/models"
)

// StartDiscovery begins scanning for nearby WiFi Direct devices on Linux
func (m *Manager) startPlatformDiscovery() error {
	// Check if wpa_supplicant is installed and running
	cmd := exec.Command("pidof", "wpa_supplicant")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("wpa_supplicant is not running: %v", err)
	}

	// Initialize wpa_cli for WiFi Direct operations
	cmd = exec.Command("wpa_cli", "p2p_find")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to start p2p discovery: %v", err)
	}

	// Start goroutine to monitor for new devices
	go m.monitorDevices()

	return nil
}

// monitorDevices continuously monitors for new WiFi Direct devices
func (m *Manager) monitorDevices() {
	for m.isScanning {
		cmd := exec.Command("wpa_cli", "p2p_peers")
		output, err := cmd.Output()
		if err != nil {
			log.Printf("Error getting peer list: %v", err)
			continue
		}

		peers := strings.Split(string(output), "\n")
		for _, peer := range peers {
			if peer == "" {
				continue
			}

			// Get peer details
			cmd = exec.Command("wpa_cli", "p2p_peer", peer)
			details, err := cmd.Output()
			if err != nil {
				continue
			}

			// Parse peer details and update devices map
			device := parseDeviceInfo(string(details))
			if device != nil {
				m.deviceLock.Lock()
				m.devices[device.MAC] = *device
				m.deviceLock.Unlock()
			}
		}
	}
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
		return fmt.Errorf("failed to connect to device: %v", err)
	}

	return nil
}

// disconnectPlatformDevice implements Linux-specific device disconnection
func (m *Manager) disconnectPlatformDevice(mac string) error {
	// Remove P2P group using wpa_cli
	cmd := exec.Command("wpa_cli", "p2p_group_remove", mac)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to disconnect device: %v", err)
	}

	return nil
}
