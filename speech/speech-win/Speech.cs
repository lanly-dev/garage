using System.Runtime.InteropServices;
using System.Speech.Synthesis;
namespace Speech
{
  class Speech
  {
    private static SpeechSynthesizer synthesizer = new SpeechSynthesizer();
    private static InstalledVoice[] voices = synthesizer.GetInstalledVoices().ToArray();

    static Speech()
    {
      if (!isWindows())
      {
        throw new PlatformNotSupportedException("SpeechSynthesizer is only supported on Windows platforms.");
      }
      synthesizer.SetOutputToDefaultAudioDevice();
    }

    static void Main()
    {
      // Speak("hello");
      tryVoices();
      Console.WriteLine(isWindows());
      pc(GetVoiceNames());
    }

    static void Speak(string text)
    {
      synthesizer.Speak(text);
    }

    static List<string> GetVoiceNames()
    {
      List<string> names = new List<string>();
      foreach (InstalledVoice voice in voices)
      {
        names.Add(voice.VoiceInfo.Name);
      }
      return names;
    }

    private static bool isWindows()
    {
      return System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
    }

    private static void tryVoices()
    {
      Speak($"There are {voices.Length} installed voices.");
      List<string> names = GetVoiceNames();
      for (int i = 0; i < names.Count; i++)
      {
        synthesizer.SelectVoice(names[i]);
        Speak($"This {names[i]} voice");
      }
    }

    // Print collection
    private static void pc<T>(IEnumerable<T> collection)
    {
      Console.WriteLine(string.Join(", ", collection));
    }
  }
}