package wifidirect

import (
	"fmt"
	"log"
	"sync"

	"github.com/yourusername/gocast/models"
)

// Manager handles WiFi Direct device discovery and connection
type Manager struct {
	devices    map[string]models.DeviceInfo
	deviceLock sync.RWMutex
	isScanning bool
}

// NewManager creates a new WiFi Direct manager instance
func NewManager() *Manager {
	return &Manager{
		devices: make(map[string]models.DeviceInfo),
	}
}

// StartDiscovery begins scanning for nearby WiFi Direct devices
func (m *Manager) StartDiscovery() error {
	if m.isScanning {
		return fmt.Errorf("discovery already in progress")
	}

	m.isScanning = true
	log.Println("Started WiFi Direct device discovery")

	return m.startPlatformDiscovery()
}

// StopDiscovery stops the device discovery process
func (m *Manager) StopDiscovery() {
	if !m.isScanning {
		return
	}

	m.isScanning = false
	log.Println("Stopped WiFi Direct device discovery")
}

// GetDiscoveredDevices returns a list of discovered devices
func (m *Manager) GetDiscoveredDevices() []models.DeviceInfo {
	m.deviceLock.RLock()
	defer m.deviceLock.RUnlock()

	devices := make([]models.DeviceInfo, 0, len(m.devices))
	for _, device := range m.devices {
		devices = append(devices, device)
	}

	return devices
}

// ConnectToDevice establishes a connection with a discovered device
func (m *Manager) ConnectToDevice(mac string) error {
	m.deviceLock.RLock()
	device, exists := m.devices[mac]
	m.deviceLock.RUnlock()

	if !exists {
		return fmt.Errorf("device with MAC %s not found", mac)
	}

	log.Printf("Connecting to device: %s (%s)\n", device.DeviceName, device.MAC)
	return m.connectToPlatformDevice(mac)
}

// DisconnectDevice disconnects from a connected device
func (m *Manager) DisconnectDevice(mac string) error {
	m.deviceLock.RLock()
	_, exists := m.devices[mac]
	m.deviceLock.RUnlock()

	if !exists {
		return fmt.Errorf("device with MAC %s not found", mac)
	}

	return m.disconnectPlatformDevice(mac)
}
