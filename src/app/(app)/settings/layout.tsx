import SettingsTabs from "@/components/SettingsTabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5"><SettingsTabs />{children}</div>;
}