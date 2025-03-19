//go:build windows

package wifidirect

import (
	"fmt"
	"log"
	"os/exec"
	"strings"
	"time"

	"github.com/yourusername/gocast/models"
)

// StartDiscovery begins scanning for nearby WiFi Direct devices on Windows
func (m *Manager) startPlatformDiscovery() error {
	// Check if WiFi Direct and Miracast are supported
	cmd := exec.Command("netsh", "wlan", "show", "drivers")
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to check WiFi Direct support: %v", err)
	}

	if !strings.Contains(string(output), "Hosted network supported") {
		return fmt.Errorf("WiFi Direct is not supported on this device")
	}

	// Enable WiFi Direct and Miracast support
	cmd = exec.Command("netsh", "wlan", "set", "hostednetwork", "mode=allow")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to enable WiFi Direct: %v", err)
	}

	// Enable Miracast display source
	cmd = exec.Command("netsh", "wlan", "set", "wirelessdisplay", "role=source")
	if err := cmd.Run(); err != nil {
		log.Printf("Warning: Failed to enable Miracast source: %v", err)
	}

	// Configure WiDi settings for extended display
	cmd = exec.Command("netsh", "wlan", "set", "wirelessdisplay", "settings=extendeddisplay")
	if err := cmd.Run(); err != nil {
		log.Printf("Warning: Failed to configure extended display: %v", err)
	}

	// Start monitoring for devices
	go m.monitorDevices()

	return nil
}

// monitorDevices continuously monitors for new WiFi Direct devices
func (m *Manager) monitorDevices() {
	for m.isScanning {
		// Look for Miracast displays
		cmd := exec.Command("netsh", "wlan", "show", "wirelessdisplay")
		output, err := cmd.Output()
		if err == nil {
			m.parseWirelessDisplays(string(output))
		}

		// Advertise as Miracast source
		cmd = exec.Command("netsh", "wlan", "set", "wirelessdisplay", "state=active")
		if err := cmd.Run(); err != nil {
			log.Printf("Error advertising Miracast source: %v", err)
		}

		// Also check regular WiFi Direct devices
		cmd = exec.Command("netsh", "wlan", "show", "networks", "mode=Bssid")
		output, err = cmd.Output()
		if err != nil {
			log.Printf("Error getting network list: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}

		// Parse network list and update devices
		networks := strings.Split(string(output), "\n")
		for _, line := range networks {
			if strings.Contains(line, "DIRECT-") || strings.Contains(line, "Miracast") {
				device := parseDeviceInfo(line)
				if device != nil {
					m.deviceLock.Lock()
					m.devices[device.MAC] = *device
					m.deviceLock.Unlock()
				}
			}
		}

		time.Sleep(2 * time.Second)
	}
}

// parseWirelessDisplays parses wireless display output and updates device list
func (m *Manager) parseWirelessDisplays(output string) {
	lines := strings.Split(output, "\n")
	var currentDevice *models.DeviceInfo

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Device name:") {
			currentDevice = &models.DeviceInfo{}
			currentDevice.DeviceName = strings.TrimPrefix(line, "Device name:")
		} else if currentDevice != nil && strings.HasPrefix(line, "MAC address:") {
			currentDevice.MAC = strings.TrimPrefix(line, "MAC address:")
			if currentDevice.MAC != "" {
				m.deviceLock.Lock()
				m.devices[currentDevice.MAC] = *currentDevice
				m.deviceLock.Unlock()
			}
			currentDevice = nil
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
