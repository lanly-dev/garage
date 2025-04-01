using Microsoft.Win32;

class Program
{

  static void Main()
  {
    // addKey();
    // removeKey();
    AddContextMenuItem();
  }
  static void addKey()
  {
    RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\MyApp");
    if (key != null)
    {
      // Set a value in the subkey
      key.SetValue("MyValue", "Hello, World!123");
      Console.WriteLine("Subkey created and value set successfully.");
    }
    else
    {
      Console.WriteLine("Failed to create or open the subkey.");
    }
  }
  static void removeKey()
  {
    Registry.CurrentUser.DeleteSubKey(@"Software\MyApp");
  }

  static void AddContextMenuItem()
  {

    string keyPath = @"Directory\Background\shell\OpenWithMyApp";

    using (RegistryKey key = Registry.ClassesRoot.CreateSubKey(keyPath))
    {
      if (key != null)
      {
        key.SetValue("", "Open with MyApp");
        key.SetValue("Icon", @"D:\test\icon.svg");
      }
    }

    using (RegistryKey commandKey = Registry.ClassesRoot.CreateSubKey(keyPath + @"\command"))
    {
      if (commandKey != null)
      {
        commandKey.SetValue("", @"D:\test\Rainmeter.lnk");
      }
    }

    Console.WriteLine("Context menu item added successfully!");
  }
}