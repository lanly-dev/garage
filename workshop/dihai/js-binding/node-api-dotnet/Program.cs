namespace Microsoft.JavaScript.NodeApi;
using System.Speech.Synthesis;

[JSExport]
public static class Program
{
    private const int MAX_CHARS = 45;
    private static SpeechSynthesizer synthesizer = new SpeechSynthesizer();


    public static string Hello(string greeter)
    {
        System.Console.WriteLine($"Hello {greeter}!");
        return $"Hello {greeter}!";
    }

    public static void Speak(string text = "hello world, how are you?")
    {
      if (text.Length > MAX_CHARS) {
        synthesizer.Speak("Text too long");
        return;
      }
      synthesizer.Speak(text);
    }
}
