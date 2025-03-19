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
	log.Println("[Windows] Starting WiFi Direct platform discovery")
	// Check if WiFi Direct and Miracast are supported
	cmd := exec.Command("netsh", "wlan", "show", "drivers")
	output, err := cmd.Output()
	if err != nil {
		log.Printf("[Windows] Failed to check WiFi Direct support: %v", err)
		return fmt.Errorf("failed to check WiFi Direct support: %v", err)
	}
	log.Println("[Windows] Successfully retrieved driver information")

	if !strings.Contains(string(output), "Hosted network supported") {
		log.Println("[Windows] WiFi Direct is not supported on this device")
		return fmt.Errorf("WiFi Direct is not supported on this device")
	}
	log.Println("[Windows] WiFi Direct is supported on this device")

	// Enable WiFi Direct and Miracast support
	cmd = exec.Command("netsh", "wlan", "set", "hostednetwork", "mode=allow")
	if err := cmd.Run(); err != nil {
		log.Printf("[Windows] Failed to enable WiFi Direct: %v", err)
		return fmt.Errorf("failed to enable WiFi Direct: %v", err)
	}
	log.Println("[Windows] Successfully enabled WiFi Direct")

	// Enable Miracast display source
	cmd = exec.Command("netsh", "wlan", "set", "wirelessdisplay", "role=source")
	if err := cmd.Run(); err != nil {
		log.Printf("[Windows] Failed to enable Miracast source: %v", err)
	} else {
		log.Println("[Windows] Successfully enabled Miracast source")
	}

	// Configure WiDi settings for extended display
	cmd = exec.Command("netsh", "wlan", "set", "wirelessdisplay", "settings=extendeddisplay")
	if err := cmd.Run(); err != nil {
		log.Printf("[Windows] Failed to configure extended display: %v", err)
	} else {
		log.Println("[Windows] Successfully configured extended display")
	}

	// Start monitoring for devices
	go m.monitorDevices()
	log.Println("[Windows] Started device monitoring")

	return nil
}

// monitorDevices continuously monitors for new WiFi Direct devices
func (m *Manager) monitorDevices() {
	log.Println("[Windows] Device monitoring started")
	for m.isScanning {
		// Look for Miracast displays
		cmd := exec.Command("netsh", "wlan", "show", "wirelessdisplay")
		output, err := cmd.Output()
		if err == nil {
			log.Println("[Windows] Scanning for Miracast displays")
			m.parseWirelessDisplays(string(output))
		} else {
			log.Printf("[Windows] Failed to scan for Miracast displays: %v", err)
		}

		// Advertise as Miracast source
		cmd = exec.Command("netsh", "wlan", "set", "wirelessdisplay", "state=active")
		if err := cmd.Run(); err != nil {
			log.Printf("[Windows] Error advertising Miracast source: %v", err)
		} else {
			log.Println("[Windows] Successfully advertised as Miracast source")
		}

		// Also check regular WiFi Direct devices
		cmd = exec.Command("netsh", "wlan", "show", "networks", "mode=Bssid")
		output, err = cmd.Output()
		if err != nil {
			log.Printf("[Windows] Error getting network list: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}
		log.Println("[Windows] Successfully retrieved network list")

		// Parse network list and update devices
		networks := strings.Split(string(output), "\n")
		deviceCount := 0
		for _, line := range networks {
			if strings.Contains(line, "DIRECT-") || strings.Contains(line, "Miracast") {
				device := parseDeviceInfo(line)
				if device != nil {
					log.Printf("[Windows] Found device: %s (MAC: %s)", device.DeviceName, device.MAC)
					m.deviceLock.Lock()
					m.devices[device.MAC] = *device
					m.deviceLock.Unlock()
					deviceCount++
				}
			}
		}
		log.Printf("[Windows] Found %d WiFi Direct devices", deviceCount)
		time.Sleep(2 * time.Second)
	}
	log.Println("[Windows] Device monitoring stopped")
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
	log.Printf("[Windows] Attempting to connect to device with MAC: %s", mac)
	// Connect to WiFi Direct device using netsh
	cmd := exec.Command("netsh", "wlan", "connect", "name=DIRECT-"+mac)
	if err := cmd.Run(); err != nil {
		log.Printf("[Windows] Connection failed to device %s: %v", mac, err)
		return fmt.Errorf("failed to connect to device: %v", err)
	}
	log.Printf("[Windows] Successfully connected to device %s", mac)
	return nil
}

// disconnectPlatformDevice implements Windows-specific device disconnection
func (m *Manager) disconnectPlatformDevice(mac string) error {
	log.Printf("[Windows] Attempting to disconnect device with MAC: %s", mac)
	// Disconnect from WiFi Direct device
	cmd := exec.Command("netsh", "wlan", "disconnect")
	if err := cmd.Run(); err != nil {
		log.Printf("[Windows] Failed to disconnect device %s: %v", mac, err)
		return fmt.Errorf("failed to disconnect device: %v", err)
	}
	log.Printf("[Windows] Successfully disconnected from device %s", mac)
	return nil
}
