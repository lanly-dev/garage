//go:build windows

package wifidirect

import (
	"fmt"
	"log"
	"os/exec"
	"strings"

	"github.com/yourusername/gocast/models"
)

// StartDiscovery begins scanning for nearby WiFi Direct devices on Windows
func (m *Manager) startPlatformDiscovery() error {
	// Check if WiFi Direct is supported
	cmd := exec.Command("netsh", "wlan", "show", "drivers")
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to check WiFi Direct support: %v", err)
	}

	if !strings.Contains(string(output), "Hosted network supported") {
		return fmt.Errorf("WiFi Direct is not supported on this device")
	}

	// Start WiFi Direct discovery
	cmd = exec.Command("netsh", "wlan", "set", "hostednetwork", "mode=allow")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to enable WiFi Direct: %v", err)
	}

	// Start monitoring for devices
	go m.monitorDevices()

	return nil
}

// monitorDevices continuously monitors for new WiFi Direct devices
func (m *Manager) monitorDevices() {
	for m.isScanning {
		cmd := exec.Command("netsh", "wlan", "show", "networks", "mode=Bssid")
		output, err := cmd.Output()
		if err != nil {
			log.Printf("Error getting network list: %v", err)
			continue
		}

		// Parse network list and update devices
		networks := strings.Split(string(output), "\n")
		for _, line := range networks {
			if strings.Contains(line, "DIRECT-") {
				device := parseDeviceInfo(line)
				if device != nil {
					m.deviceLock.Lock()
					m.devices[device.MAC] = *device
					m.deviceLock.Unlock()
				}
			}
		}
	}
}

// parseDeviceInfo parses the netsh output into DeviceInfo
func parseDeviceInfo(networkInfo string) *models.DeviceInfo {
	device := &models.DeviceInfo{}

	// Extract device name and MAC from network info
	if idx := strings.Index(networkInfo, "DIRECT-"); idx != -1 {
		device.DeviceName = strings.TrimSpace(networkInfo[idx:])
		// MAC address typically follows the device name
		if macIdx := strings.Index(networkInfo, ":"); macIdx != -1 {
			device.MAC = strings.TrimSpace(networkInfo[macIdx-2 : macIdx+15])
		}
	}

	if device.MAC == "" {
		return nil
	}

	return device
}

// connectToPlatformDevice implements Windows-specific device connection
func (m *Manager) connectToPlatformDevice(mac string) error {
	// Connect to WiFi Direct device using netsh
	cmd := exec.Command("netsh", "wlan", "connect", "name=DIRECT-"+mac)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to connect to device: %v", err)
	}

	return nil
}

// disconnectPlatformDevice implements Windows-specific device disconnection
func (m *Manager) disconnectPlatformDevice(mac string) error {
	// Disconnect from WiFi Direct device
	cmd := exec.Command("netsh", "wlan", "disconnect")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to disconnect device: %v", err)
	}

	return nil
}
