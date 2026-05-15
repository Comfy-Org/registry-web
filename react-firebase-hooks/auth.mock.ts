import { fn } from "storybook/test";

export const useSignInWithGoogle = fn().mockName("useSignInWithGoogle");
export const useSignInWithGithub = fn().mockName("useSignInWithGithub");
export const useSignOut = fn().mockName("useSignOut");
export const useAuthState = fn().mockName("useAuthState");

useSignInWithGoogle.mockReturnValue([fn(), undefined, false, undefined]);
useSignInWithGithub.mockReturnValue([fn(), undefined, false, undefined]);
useSignOut.mockReturnValue([fn(), false, undefined]);
useAuthState.mockReturnValue([null, false, undefined]);
