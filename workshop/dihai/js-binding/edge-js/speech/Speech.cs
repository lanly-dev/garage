using System.Reflection.Metadata;
using System.Runtime.InteropServices;
using System.Speech.Synthesis;

namespace Speech
{
  public class Speech
  {
    private const int MAX_CHARS = 45;
    private SpeechSynthesizer synthesizer = new SpeechSynthesizer();
    private InstalledVoice[] voices;
    public Speech()
    {
      if (!isWindows())
      {
        throw new PlatformNotSupportedException("SpeechSynthesizer is only supported on Windows platforms.");
      }
      synthesizer.SetOutputToDefaultAudioDevice();
      voices = synthesizer.GetInstalledVoices().ToArray();
    }

    public async Task<object> Speak(dynamic input)
    {
      return await Task.Run(() => {
        if (input.Length > MAX_CHARS) synthesizer.Speak("Text too long");
        else synthesizer.Speak(input);
        return true;
      });
    }

    List<string> GetVoiceNames()
    {
      List<string> names = new List<string>();
      foreach (InstalledVoice voice in voices)
      {
        names.Add(voice.VoiceInfo.Name);
      }
      return names;
    }

    private bool isWindows()
    {
      return System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
    }

    // Print collection
    private void pc<T>(IEnumerable<T> collection)
    {
      Console.WriteLine(string.Join(", ", collection));
    }
  }
}