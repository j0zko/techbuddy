import { useEffect, useRef, useState, useCallback } from "react";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window["SpeechRecognition"] || window["webkitSpeechRecognition"]
    : null;

export function useSpeech({ lang = "en-US", onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const supported = !!SpeechRecognition;

  useEffect(() => {
    if (!supported) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      if (transcript && onResult) onResult(transcript);
    };
    recognition.onerror = (event) => {
      setError(event.error || "speech-error");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.abort();
      } catch {
        /* noop */
      }
    };
  }, [lang, onResult, supported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  return { supported, listening, error, startListening, stopListening };
}

export const SPEECH_LANG_MAP = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-PT",
  sk: "sk-SK",
  cz: "cz-CZ",
};
