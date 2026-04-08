"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient()!;

    // Fallback: if INITIAL_SESSION fires with no user and a token refresh is in
    // flight, TOKEN_REFRESHED will arrive shortly. If nothing arrives within
    // 1.5 s the user is genuinely not logged in — release the loading state.
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Unblock the UI immediately — profile loads in the background.
        setLoading(false);
        try {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();
          setProfile(data ?? null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);

        if (event === "INITIAL_SESSION") {
          // Access token may be expired — Supabase will fire TOKEN_REFRESHED
          // shortly if a refresh token exists. Defer loading=false to avoid a
          // premature redirect while the refresh is in flight.
          fallbackTimer = setTimeout(() => {
            setLoading(false);
          }, 1500);
        } else {
          // SIGNED_OUT, TOKEN_REFRESHED(null), etc. — definitive: not logged in.
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient()!;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
