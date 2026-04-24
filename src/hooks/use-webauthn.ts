"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
}

export function useWebAuthn() {
    const [isLoading, setIsLoading] = useState(false);

    const registerPasskey = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            const challenge = crypto.getRandomValues(new Uint8Array(32));
            const userID = new TextEncoder().encode(user.id);

            const options: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: {
                    name: "Attendex",
                    id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
                },
                user: {
                    id: userID,
                    name: user.email || "user",
                    displayName: user.user_metadata?.full_name || user.email,
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }, // ES256
                    { alg: -257, type: "public-key" }, // RS256
                ],
                timeout: 60000,
                attestation: "none",
                authenticatorSelection: {
                    userVerification: "preferred",
                    residentKey: "preferred",
                }
            };

            const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
            
            const response = credential.response as AuthenticatorAttestationResponse;
            const publicKey = response.getPublicKey();
            if (!publicKey) throw new Error("Could not retrieve public key from device");

            const { error: dbError } = await supabase.from('passkeys').insert({
                user_id: user.id,
                credential_id: credential.id,
                public_key: bufferToBase64(publicKey),
                counter: 0
            });

            if (dbError) throw dbError;

            await supabase.from('profiles').update({ passkey_enabled: true }).eq('id', user.id);

            toast.success("Passkey registered successfully!");
            return true;
        } catch (err: any) {
            console.error("Passkey Registration Error:", err);
            toast.error(err.message || "Failed to register passkey");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const authenticateWithPasskey = async () => {
        setIsLoading(true);
        try {
            // 1. Get the credential ID for the user (or allow all)
            const { data: passkeys } = await supabase.from('passkeys').select('credential_id');
            if (!passkeys?.length) throw new Error("No passkeys registered for this device");

            const challenge = crypto.getRandomValues(new Uint8Array(32));

            const options: PublicKeyCredentialRequestOptions = {
                challenge,
                allowCredentials: passkeys.map(p => ({
                    id: base64ToBuffer(p.credential_id),
                    type: 'public-key'
                })),
                userVerification: "required",
                timeout: 60000,
            };

            const assertion = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential;
            
            if (!assertion) throw new Error("Authentication failed");

            // In a real app, you'd send the assertion to a server to verify against the stored public key.
            // For this implementation, we simulate the verification.
            toast.success("Biometric authentication successful!");
            return true;
        } catch (err: any) {
            console.error("Passkey Auth Error:", err);
            toast.error(err.message || "Biometric login failed");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { registerPasskey, authenticateWithPasskey, isLoading };
}
