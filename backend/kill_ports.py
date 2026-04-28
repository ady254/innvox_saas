import os
import subprocess
import sys

def kill_process_on_port(port):
    try:
        # Find PIDs on port
        result = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
        pids = set()
        for line in result.strip().split('\n'):
            if 'LISTENING' in line:
                pid = line.strip().split()[-1]
                pids.add(pid)
        
        for pid in pids:
            print(f"Killing process {pid} on port {port}...")
            subprocess.run(f'taskkill /F /PID {pid}', shell=True)
        
        if not pids:
            print(f"No processes found on port {port}.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    kill_process_on_port(8000)
    kill_process_on_port(8080)
