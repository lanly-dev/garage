package models

import "net"

// DeviceInfo represents a discovered WiFi Direct device
type DeviceInfo struct {
	MAC          string
	DeviceName   string
	IPAddress    net.IP
	Capabilities []string
}
