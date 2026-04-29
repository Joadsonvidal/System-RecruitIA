import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TimeClockSettings {
  id?: string;
  owner_id?: string;
  office_address: string | null;
  office_latitude: number | null;
  office_longitude: number | null;
  allowed_radius_meters: number;
  workday_start: string;
  workday_end: string;
  require_selfie: boolean;
  enforce_geofence: boolean;
}

export interface TimeClockEntry {
  id: string;
  user_id: string;
  account_owner_id: string;
  entry_type: "entrada" | "saida";
  clocked_at: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  selfie_url: string | null;
  within_geofence: boolean;
  distance_meters: number | null;
  device_info: string | null;
  notes: string | null;
}

const defaultSettings: TimeClockSettings = {
  office_address: null,
  office_latitude: null,
  office_longitude: null,
  allowed_radius_meters: 100,
  workday_start: "08:00",
  workday_end: "18:00",
  require_selfie: true,
  enforce_geofence: true,
};

// Haversine distance in meters
export const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const useTimeClock = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TimeClockSettings>(defaultSettings);
  const [entries, setEntries] = useState<TimeClockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data: s } = await supabase
        .from("time_clock_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (s) setSettings(s as TimeClockSettings);

      const { data: e } = await supabase
        .from("time_clock_entries")
        .select("*")
        .order("clocked_at", { ascending: false })
        .limit(500);
      if (e) setEntries(e as TimeClockEntry[]);
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel("time-clock")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_clock_entries" },
        load,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_clock_settings" },
        load,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const saveSettings = async (s: TimeClockSettings) => {
    if (!user) return { error: "Não autenticado" };
    const payload = { ...s, owner_id: user.id };
    const { error } = await supabase
      .from("time_clock_settings")
      .upsert(payload, { onConflict: "owner_id" });
    return { error: error?.message };
  };

  const getServerTime = async (): Promise<Date> => {
    const { data } = await supabase.rpc("get_server_time");
    return data ? new Date(data as string) : new Date();
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`,
      );
      const j = await r.json();
      return j.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
  };

  const uploadSelfie = async (blob: Blob): Promise<string | null> => {
    if (!user) return null;
    const fileName = `${user.id}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("time-clock-selfies")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });
    if (error) {
      console.error("upload selfie", error);
      return null;
    }
    return fileName;
  };

  const getSelfieSignedUrl = async (path: string): Promise<string | null> => {
    const { data } = await supabase.storage
      .from("time-clock-selfies")
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  };

  const clockIn = async (params: {
    entryType: "entrada" | "saida";
    latitude: number;
    longitude: number;
    selfieBlob?: Blob;
  }) => {
    if (!user) return { error: "Não autenticado" };

    const address = await reverseGeocode(params.latitude, params.longitude);

    let withinGeofence = true;
    let distance: number | null = null;
    if (
      settings.enforce_geofence &&
      settings.office_latitude != null &&
      settings.office_longitude != null
    ) {
      distance = distanceMeters(
        params.latitude,
        params.longitude,
        settings.office_latitude,
        settings.office_longitude,
      );
      withinGeofence = distance <= settings.allowed_radius_meters;
    }

    let selfieUrl: string | null = null;
    if (params.selfieBlob) {
      selfieUrl = await uploadSelfie(params.selfieBlob);
    }

    const accountOwnerId = settings.owner_id ?? user.id;

    const { error } = await supabase.from("time_clock_entries").insert({
      user_id: user.id,
      account_owner_id: accountOwnerId,
      entry_type: params.entryType,
      latitude: params.latitude,
      longitude: params.longitude,
      address,
      selfie_url: selfieUrl,
      within_geofence: withinGeofence,
      distance_meters: distance,
      device_info: navigator.userAgent.slice(0, 200),
    });

    return {
      error: error?.message,
      withinGeofence,
      distance,
      address,
    };
  };

  const myEntries = entries.filter((e) => e.user_id === user?.id);

  return {
    settings,
    entries,
    myEntries,
    loading,
    saveSettings,
    clockIn,
    getServerTime,
    getSelfieSignedUrl,
  };
};
