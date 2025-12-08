# ⚡ MASS NULL SAFETY FIX - Copy/Paste These Commands

## Execute these in PowerShell from the mk4 directory:

```powershell
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
```

## Fix 1: AuthorityHookRenderer.vue
```powershell
(Get-Content "components\authority-hook\AuthorityHookRenderer.vue") -replace 'if \(Array\.isArray\(props\.data\.authority_points\)\)', 'if (Array.isArray(props.data?.authority_points))' | Set-Content "components\authority-hook\AuthorityHookRenderer.vue"

(Get-Content "components\authority-hook\AuthorityHookRenderer.vue") -replace 'if \(props\.data\[', 'if (props.data?.[' | Set-Content "components\authority-hook\AuthorityHookRenderer.vue"

(Get-Content "components\authority-hook\AuthorityHookRenderer.vue") -replace 'return props\.data\.credentials', 'return props.data?.credentials' | Set-Content "components\authority-hook\AuthorityHookRenderer.vue"

(Get-Content "components\authority-hook\AuthorityHookRenderer.vue") -replace 'return props\.data\.social_proof', 'return props.data?.social_proof' | Set-Content "components\authority-hook\AuthorityHookRenderer.vue"
```

## Fix 2: BookingCalendarRenderer.vue
```powershell
(Get-Content "components\booking-calendar\BookingCalendarRenderer.vue") -replace 'if \(props\.data\.title\)', 'if (props.data?.title)' | Set-Content "components\booking-calendar\BookingCalendarRenderer.vue"

(Get-Content "components\booking-calendar\BookingCalendarRenderer.vue") -replace 'return props\.data\.description', 'return props.data?.description' | Set-Content "components\booking-calendar\BookingCalendarRenderer.vue"

(Get-Content "components\booking-calendar\BookingCalendarRenderer.vue") -replace 'return props\.data\.calendar_service', 'return props.data?.calendar_service' | Set-Content "components\booking-calendar\BookingCalendarRenderer.vue"

(Get-Content "components\booking-calendar\BookingCalendarRenderer.vue") -replace 'if \(props\.data\.calendar_url', 'if (props.data?.calendar_url' | Set-Content "components\booking-calendar\BookingCalendarRenderer.vue"

(Get-Content "components\booking-calendar\BookingCalendarRenderer.vue") -replace 'if \(Array\.isArray\(props\.data\.available_times\)\)', 'if (Array.isArray(props.data?.available_times))' | Set-Content "components\booking-calendar\BookingCalendarRenderer.vue"
```

## Fix 3: CallToActionRenderer.vue
```powershell
(Get-Content "components\call-to-action\CallToActionRenderer.vue") -replace 'if \(props\.data\.background_color\)', 'if (props.data?.background_color)' | Set-Content "components\call-to-action\CallToActionRenderer.vue"

(Get-Content "components\call-to-action\CallToActionRenderer.vue") -replace 'if \(props\.data\.text_color\)', 'if (props.data?.text_color)' | Set-Content "components\call-to-action\CallToActionRenderer.vue"
```

## Fix 4: GuestIntroRenderer.vue
```powershell
(Get-Content "components\guest-intro\GuestIntroRenderer.vue") -replace 'return props\.data\.availability', 'return props.data?.availability' | Set-Content "components\guest-intro\GuestIntroRenderer.vue"
```

## Fix 5: PodcastPlayerRenderer.vue
```powershell
(Get-Content "components\podcast-player\PodcastPlayerRenderer.vue") -replace 'return props\.data\.title \|\|', 'return props.data?.title ||' | Set-Content "components\podcast-player\PodcastPlayerRenderer.vue"

(Get-Content "components\podcast-player\PodcastPlayerRenderer.vue") -replace 'return props\.data\.description', 'return props.data?.description' | Set-Content "components\podcast-player\PodcastPlayerRenderer.vue"

(Get-Content "components\podcast-player\PodcastPlayerRenderer.vue") -replace 'if \(Array\.isArray\(props\.data\.episodes\)\)', 'if (Array.isArray(props.data?.episodes))' | Set-Content "components\podcast-player\PodcastPlayerRenderer.vue"
```

## Fix 6: StatsRenderer.vue
```powershell
(Get-Content "components\stats\StatsRenderer.vue") -replace 'if \(Array\.isArray\(props\.data\.stats\)\)', 'if (Array.isArray(props.data?.stats))' | Set-Content "components\stats\StatsRenderer.vue"

(Get-Content "components\stats\StatsRenderer.vue") -replace 'return props\.data\.stats', 'return props.data?.stats' | Set-Content "components\stats\StatsRenderer.vue"
```

## Fix 7: VideoIntroRenderer.vue
```powershell
(Get-Content "components\video-intro\VideoIntroRenderer.vue") -replace 'if \(props\.data\.title\) return props\.data\.title', 'if (props.data?.title) return props.data.title' | Set-Content "components\video-intro\VideoIntroRenderer.vue"

(Get-Content "components\video-intro\VideoIntroRenderer.vue") -replace 'return props\.data\.description', 'return props.data?.description' | Set-Content "components\video-intro\VideoIntroRenderer.vue"

(Get-Content "components\video-intro\VideoIntroRenderer.vue") -replace 'if \(props\.data\.video_url', 'if (props.data?.video_url' | Set-Content "components\video-intro\VideoIntroRenderer.vue"
```

---

## Or Use This Single Command (Replace ALL at once):

```powershell
# This regex finds props.data. (not already props.data?.) and adds the ?
Get-ChildItem -Path "components" -Recurse -Filter "*.vue" | ForEach-Object {
    (Get-Content $_.FullName) -replace 'props\.data\.(?!\?)', 'props.data?.' | Set-Content $_.FullName
}

# This regex finds props.data[ (not already props.data?.[) and adds the ?
Get-ChildItem -Path "components" -Recurse -Filter "*.vue" | ForEach-Object {
    (Get-Content $_.FullName) -replace 'props\.data\[(?!\?)', 'props.data?.[' | Set-Content $_.FullName
}
```

---

## After running these commands:

```powershell
npm test
```

Expected: **154/154 tests passing** ✅

---

## If you prefer manual editing:

Search for these patterns in all `.vue` files:
1. `props.data.` → change to `props.data?.`
2. `props.data[` → change to `props.data?.[`

Make sure NOT to change:
- `props.data?.` (already has it)
- `props.data?.[` (already has it)
