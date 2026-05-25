import { Avatar } from "@mui/material";

export function getDoctorInitials(profile) {
  if (!profile) return "DR";
  const first = profile.firstName?.[0] || "";
  const last = profile.lastName?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "DR";
}

export function getDoctorDisplayName(profile) {
  if (!profile) return "Doctor";
  const title = profile.title ? `${profile.title} ` : "";
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return `${title}${name}`.trim() || "Doctor";
}

const sizeMap = {
  sm: { width: 56, height: 56, fontSize: "1rem" },
  md: { width: 88, height: 88, fontSize: "1.35rem" },
  lg: { width: 112, height: 112, fontSize: "1.75rem" },
};

export default function DoctorAvatar({ profile, size = "md", className = "" }) {
  const dims = sizeMap[size] || sizeMap.md;
  const imageUrl = profile?.imageUrl;
  const initials = getDoctorInitials(profile);

  return (
    <Avatar
      src={imageUrl || undefined}
      alt={getDoctorDisplayName(profile)}
      className={`ring-2 ring-white shadow-md ${className}`}
      sx={{
        width: dims.width,
        height: dims.height,
        fontSize: dims.fontSize,
        fontWeight: 600,
        bgcolor: imageUrl ? "grey.200" : "#020e7c",
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {!imageUrl ? initials : null}
    </Avatar>
  );
}
