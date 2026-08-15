# Declare SendMessage Parameter Values
$HWND = -1
$WM_SYSCOMMAND = 0x0112
$SC_MONITORPOWER = 0xF170
$MONITOR_ON = -1
$MONITOR_OFF = 2
#Store the C# signature of the SendMessage function.
$signature = @"
[DllImport("user32.dll")]
public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);
"@
#Add the SendMessage function as a static method of a class
$SendMessage = Add-Type -MemberDefinition $signature -Name "Win32SendMessage" -Namespace Win32Functions -PassThru
#Invoke the SendMessage Function
$SendMessage::SendMessage($HWND, $WM_SYSCOMMAND, $SC_MONITORPOWER, $MONITOR_OFF)