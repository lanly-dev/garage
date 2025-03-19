package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
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
}

// NewMiracastReceiver creates a new instance of MiracastReceiver
func NewMiracastReceiver(config Config) *MiracastReceiver {
	return &MiracastReceiver{
		config:    config,
		isRunning: false,
	}
}

// Start initializes and starts the Miracast receiver
func (m *MiracastReceiver) Start() error {
	addr := fmt.Sprintf(":%d", m.config.ListenPort)
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("failed to start listener: %v", err)
	}

	m.listener = listener
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

	if err := m.listener.Close(); err != nil {
		return fmt.Errorf("failed to stop listener: %v", err)
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
