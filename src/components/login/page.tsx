'use client';

import {
  Box,
  Stack,
  Button,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToastActions } from '@/views/components/providers';
import { LoginInputs } from './LoginInputs';

export const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const { showSuccess, showError } = useToastActions();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation (components handle their own validation)
    if (!email || !password) {
      setIsLoading(false);
      showError(t('errors.fillRequiredFields'));
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        showError(t('errors.loginFailed'));
        return;
      }

      if (result?.ok) {
        showSuccess(t('toast.loginSuccess'));
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      }
    } catch {
      const errorMessage = t('errors.unknownError');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      {/* Left section (Login form) */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 4, sm: 6, md: 8 },
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ maxWidth: "400px", mx: "auto", width: "100%" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {t('login.title')}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {t('login.subtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit} noValidate>
            <Stack spacing={3}>
              <LoginInputs
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                disabled={isLoading}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      color="primary"
                      disabled={isLoading}
                    />
                  }
                  label={t('login.rememberMe')}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {isLoading ? t('login.signingIn') : t('login.signInButton')}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>

      {/* Right section (Branding) */}
      {/* Right section (Branding) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "50%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#241f21",
          color: "#fff",
          backgroundImage: `linear-gradient(rgba(36, 31, 33, 0.9), rgba(36, 31, 33, 0.9)), url('/images/background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          p: 6,
          textAlign: "center",
        }}
      >
        <Box 
          sx={{ 
            mb: 5, 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Box 
            sx={{ 
              width: '300px', 
              height: '80px', 
              position: 'relative',
              bgcolor: 'transparent'
            }}
          >
            <Image
              src="/assets/images/logo.png"
              alt={`${t('login.companyName')} - ${t('login.brandingTitle')}`}
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
        </Box>
        
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
          {t('login.brandingTitle')}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: '400px' }}>
          {t('login.brandingDescription')}
        </Typography>
      </Box>
    </Box>
  );
}; 