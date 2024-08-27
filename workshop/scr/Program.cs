using System;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;

namespace MyScreensaver
{
  public class ScreensaverForm : Form
  {
    private System.Windows.Forms.Timer timer;
    private System.Windows.Forms.Timer exitDelayTimer;
    private Random random;
    private int x, y;
    private int dx, dy;
    private bool allowExit;

    public ScreensaverForm()
    {
      // Set form properties
      this.FormBorderStyle = FormBorderStyle.None;
      this.WindowState = FormWindowState.Maximized;
      this.TopMost = true;
      this.BackColor = Color.Black;

      // Hide the cursor
      Cursor.Hide();

      // Initialize variables
      random = new Random();
      x = random.Next(0, this.ClientSize.Width);
      y = random.Next(0, this.ClientSize.Height);
      dx = random.Next(-5, 6);
      dy = random.Next(-5, 6);

      // Ensure movement
      if (dx == 0 && dy == 0)
      {
        dx = 5;
        dy = 5;
      }

      // Setup the main timer
      timer = new System.Windows.Forms.Timer();
      timer.Interval = 16; // Approximately 60 FPS
      timer.Tick += Timer_Tick;
      timer.Start();

      // Initialize exit delay timer
      exitDelayTimer = new System.Windows.Forms.Timer();
      exitDelayTimer.Interval = 2000; // 2 seconds delay
      exitDelayTimer.Tick += (s, e) => allowExit = true;
      exitDelayTimer.Start();

      // Set allowExit to false initially
      allowExit = false;
    }

    private void Timer_Tick(object sender, EventArgs e)
    {
      // Update position
      x += dx;
      y += dy;

      // Bounce off edges
      if (x < 0 || x > this.ClientSize.Width - 50)
      {
        dx = -dx;
      }

      if (y < 0 || y > this.ClientSize.Height - 50)
      {
        dy = -dy;
      }

      // Redraw the form
      this.Invalidate();
    }

    protected override void OnPaint(PaintEventArgs e)
    {
      // Anti-aliasing for smooth edges
      e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;

      // Draw the ball
      using (Brush brush = new SolidBrush(Color.White))
      {
        e.Graphics.FillEllipse(brush, x, y, 50, 50);
      }
    }

    protected override void OnMouseMove(MouseEventArgs e)
    {
      if (allowExit)
      {
        // Restore the cursor and close the screensaver on mouse move
        Cursor.Show();
        Close();
      }
    }

    protected override void OnKeyDown(KeyEventArgs e)
    {
      if (allowExit)
      {
        // Restore the cursor and close the screensaver on key press
        Cursor.Show();
        Close();
      }
    }

    protected override void OnMouseClick(MouseEventArgs e)
    {
      if (allowExit)
      {
        // Restore the cursor and close the screensaver on mouse click
        Cursor.Show();
        Close();
      }
    }

    [STAThread]
    static void Main()
    {
      Application.EnableVisualStyles();
      Application.SetCompatibleTextRenderingDefault(false);
      Application.Run(new ScreensaverForm());
    }
  }
}
