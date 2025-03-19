# GoCast

A cross-platform WiFi Direct streaming application written in Go.

## Building for Linux

### Prerequisites

1. Go 1.24.1 or later
2. wpa_supplicant (for WiFi Direct support)
3. wpa_cli (command-line tool for wpa_supplicant)

### Installation

1. Install the required dependencies:
```bash
# For Ubuntu/Debian
sudo apt-get update
sudo apt-get install wpasupplicant

# For Fedora
sudo dnf install wpa_supplicant

# For Arch Linux
sudo pacman -S wpa_supplicant
```

2. Build the application:
```bash
go build -o gocast
```

3. Run the application:
```bash
./gocast
```

### Notes

- Make sure wpa_supplicant is running and configured for WiFi Direct (P2P) support
- The application requires root privileges to use WiFi Direct functionality
- For detailed configuration of wpa_supplicant, refer to your distribution's documentation

## License

MIT License