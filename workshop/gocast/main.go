package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/yourusername/gocast/rtsp"
	"github.com/yourusername/gocast/wifidirect"
)

// Config holds the application configuration
type Config struct {
	ListenPort int
	DeviceName string
}

// MiracastReceiver represents the main receiver instance
type MiracastReceiver struct {
	config     Config
	listener   net.Listener
	isRunning  bool
	connection net.Conn
	rtspServer *rtsp.RTSPServer
	wdManager  *wifidirect.Manager
}

// NewMiracastReceiver creates a new instance of MiracastReceiver
func NewMiracastReceiver(config Config) *MiracastReceiver {
	rtspServer := rtsp.NewRTSPServer(config.ListenPort)
	wdManager := wifidirect.NewManager()

	return &MiracastReceiver{
		config:     config,
		isRunning:  false,
		rtspServer: rtspServer,
		wdManager:  wdManager,
	}
}

// Start initializes and starts the Miracast receiver
func (m *MiracastReceiver) Start() error {
	// Start RTSP server
	if err := m.rtspServer.Start(); err != nil {
		return fmt.Errorf("failed to start RTSP server: %v", err)
	}

	// Start WiFi Direct manager
	if err := m.wdManager.StartDiscovery(); err != nil {
		return fmt.Errorf("failed to start WiFi Direct discovery: %v", err)
	}

	m.isRunning = true

	log.Printf("Miracast receiver started on port %d\n", m.config.ListenPort)
	log.Printf("Device name: %s\n", m.config.DeviceName)

	return nil
}

// Stop gracefully stops the Miracast receiver
func (m *MiracastReceiver) Stop() error {
	if !m.isRunning {
		return nil
	}

	if m.connection != nil {
		m.connection.Close()
	}

	if m.listener != nil {
		if err := m.listener.Close(); err != nil {
			log.Printf("Error closing listener: %v", err)
		}
	}

	// Stop WiFi Direct discovery
	if m.wdManager != nil {
		m.wdManager.StopDiscovery()
	}

	m.isRunning = false
	log.Println("Miracast receiver stopped")
	return nil
}

// handleConnection manages an incoming connection
func (m *MiracastReceiver) handleConnection(conn net.Conn) {
	defer conn.Close()
	m.connection = conn

	log.Printf("New connection from %s\n", conn.RemoteAddr())

	// TODO: Implement RTSP handshake and media streaming
	// This is where we'll handle the actual Miracast protocol
}

func main() {
	config := Config{
		ListenPort: 7236, // Default Miracast port
		DeviceName: "Go Miracast Receiver",
	}

	receiver := NewMiracastReceiver(config)

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	if err := receiver.Start(); err != nil {
		log.Fatalf("Failed to start receiver: %v", err)
	}

	// Wait for shutdown signal
	<-sigChan
	log.Println("Shutting down...")

	if err := receiver.Stop(); err != nil {
		log.Printf("Error during shutdown: %v", err)
	}
}
