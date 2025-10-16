import torch
import sys
import os

# Add Wav2Lip directory to path
sys.path.append('Wav2Lip')
from models import Wav2Lip

def convert_checkpoint(old_path, new_path):
    """Convert old checkpoint to be compatible with newer PyTorch versions"""
    
    try:
        # First, try to load as TorchScript
        print(f"Attempting to load TorchScript model from {old_path}")
        model = torch.jit.load(old_path, map_location='cpu')
        
        # Extract state dict from TorchScript model
        state_dict = model.state_dict()
        
        # Remove 'module.' prefix if present
        new_state_dict = {}
        for k, v in state_dict.items():
            new_key = k.replace('module.', '')
            new_state_dict[new_key] = v
        
        # Save as regular state dict (not TorchScript)
        torch.save({
            'state_dict': new_state_dict
        }, new_path, _use_new_zipfile_serialization=False)
        
        print(f"Converted TorchScript checkpoint saved to {new_path}")
        return True
        
    except Exception as e1:
        print(f"TorchScript load failed: {e1}")
        
        # Fallback: try loading as regular checkpoint
        try:
            checkpoint = torch.load(old_path, map_location='cpu', weights_only=False)
            print(f"Loaded as regular checkpoint from {old_path}")
            
            # Create model and load state dict
            model = Wav2Lip()
            
            if "state_dict" in checkpoint:
                state_dict = checkpoint["state_dict"]
            else:
                state_dict = checkpoint
                
            # Remove 'module.' prefix if present
            new_state_dict = {}
            for k, v in state_dict.items():
                new_key = k.replace('module.', '')
                new_state_dict[new_key] = v
            
            model.load_state_dict(new_state_dict)
            
            # Save as regular state dict (not TorchScript)
            torch.save({
                'state_dict': model.state_dict()
            }, new_path, _use_new_zipfile_serialization=False)
            
            print(f"Converted checkpoint saved to {new_path}")
            return True
            
        except Exception as e2:
            print(f"Both conversion methods failed:")
            print(f"TorchScript error: {e1}")
            print(f"Regular load error: {e2}")
            return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_checkpoint.py <input.pth> <output.pth>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    convert_checkpoint(input_path, output_path)