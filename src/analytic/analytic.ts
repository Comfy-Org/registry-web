import posthog from "posthog-js";

interface UserProfile {
  $email: string | null;
  $first_name?: string;
  $last_name?: string;
  $phone?: string;
  [key: string]: any;
}

class Analytics {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NEXT_PUBLIC_ENV === "production";
  }

  public track(event: string, properties?: object): void {
    if (this.isProduction) {
      posthog.capture(event, properties);
    } else {
      console.log(`Track - Event: ${event}, Properties: ${JSON.stringify(properties)}`);
    }
  }

  public identify(distinctId: string): void {
    if (this.isProduction) {
      posthog.identify(distinctId);
    } else {
      console.log(`Identify - Distinct ID: ${distinctId}`);
    }
  }

  public setProfile(updates: UserProfile): void {
    if (this.isProduction) {
      posthog.setPersonProperties(updates);
    } else {
      console.log(`Set Profile - Updates: ${JSON.stringify(updates)}`);
    }
  }
}

const analytic = new Analytics();
export default analytic;
