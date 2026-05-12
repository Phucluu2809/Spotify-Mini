# 📋 Spotify Mini - Manual Testing Checklist
## Playlist & Album Features - Step-by-Step Testing Guide

**Date:** 2024  
**Tester:** QA Team  
**Environment:** iOS/Android with Expo  
**Backend:** http://192.168.1.6:5000  

---

## SECTION 1: SETUP & PREREQUISITES

### Step 0.1: Verify Backend is Running
- [ ] Open browser, navigate to: http://192.168.1.6:5000
- [ ] Verify you see: "Spotify Mini API running"
- [ ] Notes: ___________________________________________

### Step 0.2: Clear App Data & Login
- [ ] Uninstall app or clear app storage
- [ ] Start Expo app fresh
- [ ] Verify you're on login screen
- [ ] Notes: ___________________________________________

---

## SECTION 2: BACKEND STATUS TESTS

### Test B1: Backend Health Check
**Objective:** Verify backend is running and responsive
- [ ] Try to create new account (indicates backend is working)
- [ ] If creation succeeds or fails properly, backend is working
- [ ] Notes: ___________________________________________

### Test B2: Database Connection
**Objective:** Verify database has data
- [ ] After logging in, navigate to Library > Albums tab
- [ ] [ ] Should see album list (not empty)
- [ ] [ ] Albums should have names, artist names, cover images
- [ ] [ ] At least 5 albums visible
- [ ] Notes: ___________________________________________

---

## SECTION 3: AUTHENTICATION TESTS

### Test A1: User Registration
**Objective:** New user can register

**Steps:**
1. [ ] On login screen, tap "Sign Up" or similar
2. [ ] Enter email: `testuser-${timestamp}@test.com`
3. [ ] Enter password: `TestPass123!`
4. [ ] Enter display name: `Test User`
5. [ ] Tap "Create Account" or "Register"

**Expected Results:**
- [ ] Account created successfully
- [ ] User logged in automatically
- [ ] Redirected to main app (Library tab visible)
- [ ] No error messages shown

**Notes:** ___________________________________________

### Test A2: User Login
**Objective:** Registered user can login

**Steps:**
1. [ ] If just registered, logout (find logout button)
2. [ ] On login screen, enter email and password
3. [ ] Tap "Login"

**Expected Results:**
- [ ] Login successful
- [ ] Redirected to main app
- [ ] User profile visible (if available)
- [ ] No errors shown

**Notes:** ___________________________________________

### Test A3: Token Storage Verification
**Objective:** Auth token stored securely

**Steps:**
1. [ ] Login with valid credentials
2. [ ] Navigate to different tabs (should stay logged in)
3. [ ] Close app completely
4. [ ] Reopen app

**Expected Results:**
- [ ] Still logged in after app restart
- [ ] Token persisted in SecureStore
- [ ] No login screen shown

**Notes:** ___________________________________________

### Test A4: Authentication Protection
**Objective:** Unauthorized users can't access protected content

**Steps:**
1. [ ] Logout
2. [ ] Try to navigate directly to Library or other protected screen (if possible)

**Expected Results:**
- [ ] Redirected to login screen
- [ ] Can't access protected content without login
- [ ] Proper error handling

**Notes:** ___________________________________________

---

## SECTION 4: PLAYLIST FEATURE TESTS

### Test P1: View Playlists in Library
**Objective:** Playlists tab shows user's playlists

**Steps:**
1. [ ] Login with valid account
2. [ ] Navigate to Library tab (bottom navigation)
3. [ ] Scroll or select "Playlists" section
4. [ ] Observe playlist list

**Expected Results:**
- [ ] Playlists tab loads without errors
- [ ] Shows list of playlists (or empty state if none)
- [ ] Each playlist shows:
  - [ ] Playlist name
  - [ ] Song count (e.g., "Playlist • 5 songs")
  - [ ] Cover image (or placeholder)
- [ ] Smooth scrolling, no lag

**Notes:** ___________________________________________

### Test P2: Create New Playlist
**Objective:** User can create playlist with form validation

**Steps:**
1. [ ] In Playlists section, find "+ Create Playlist" button
2. [ ] Tap button to open form
3. [ ] Leave name empty, tap "Create"

**Expected Results:**
- [ ] Error message shown: "Playlist name required" (or similar)
- [ ] Not submitted

**Steps (continuation):**
4. [ ] Enter playlist name: `My Test Playlist`
5. [ ] Enter description: `Test description for QA`
6. [ ] Toggle "Private" switch (optional, test both)
7. [ ] Tap "Create" button

**Expected Results:**
- [ ] Loading indicator shown briefly
- [ ] Success message: "Playlist created!" (or similar)
- [ ] Redirected to playlist detail screen
- [ ] New playlist visible in library

**Notes:** ___________________________________________

### Test P3: View Playlist in Detail
**Objective:** Clicking playlist shows detail with all songs

**Steps:**
1. [ ] From library, find a playlist
2. [ ] Tap on playlist card

**Expected Results:**
- [ ] Navigate to playlist detail screen
- [ ] Detail screen shows:
  - [ ] Playlist name (hero section)
  - [ ] Playlist description (if any)
  - [ ] Song count (formatted: "N bài hát")
  - [ ] Cover image (or accent color)
  - [ ] List of all songs in playlist

**Notes:** ___________________________________________

### Test P4: Play All Songs
**Objective:** "Phát tất cả" button plays first song

**Steps:**
1. [ ] On playlist detail screen
2. [ ] Verify "Phát tất cả" button visible (if songs exist)
3. [ ] Tap "Phát tất cả" button

**Expected Results:**
- [ ] Player starts immediately
- [ ] First song plays (you can hear it or see player active)
- [ ] MiniPlayer appears showing current song
- [ ] Song title and artist visible in player

**Notes:** ___________________________________________

### Test P5: Click Individual Song to Play
**Objective:** Can select and play individual songs

**Steps:**
1. [ ] On playlist detail screen
2. [ ] Find second or third song in list
3. [ ] Tap on song row

**Expected Results:**
- [ ] Selected song starts playing
- [ ] MiniPlayer shows selected song
- [ ] Row highlights to show it's playing
- [ ] Song plays from selected song (not from first)

**Notes:** ___________________________________________

### Test P6: Empty Playlist Handling
**Objective:** App handles playlists with no songs

**Steps:**
1. [ ] Create new empty playlist (don't add songs)
2. [ ] Navigate to its detail screen

**Expected Results:**
- [ ] Detail screen loads
- [ ] "Phát tất cả" button NOT shown (or disabled)
- [ ] Shows "0 bài hát" or similar
- [ ] No crash or error

**Notes:** ___________________________________________

### Test P7: Update Playlist
**Objective:** Playlist details can be edited

**Steps:**
1. [ ] On playlist detail screen
2. [ ] Find edit button (usually top-right or menu)
3. [ ] Change name to: `Updated Playlist Name`
4. [ ] Change description to: `Updated description`
5. [ ] Save changes

**Expected Results:**
- [ ] Changes saved successfully
- [ ] Detail screen updates to show new name/description
- [ ] Changes reflected in library list

**Notes:** ___________________________________________

---

## SECTION 5: ALBUM FEATURE TESTS

### Test AL1: View Albums in Library
**Objective:** Albums tab shows all available albums

**Steps:**
1. [ ] In Library tab, find "Albums" section
2. [ ] Observe album grid/list

**Expected Results:**
- [ ] Albums load without errors
- [ ] Shows grid of album cards
- [ ] Each album shows:
  - [ ] Album cover image
  - [ ] Album name
  - [ ] Artist name (format: "Album • Artist")
  - [ ] Proper colors/styling
- [ ] At least 5 albums visible

**Notes:** ___________________________________________

### Test AL2: View Album Details
**Objective:** Clicking album shows detail with all songs

**Steps:**
1. [ ] On albums section, tap on any album card

**Expected Results:**
- [ ] Navigate to album detail screen
- [ ] Screen shows:
  - [ ] Album cover image (hero section)
  - [ ] Album name (large, prominent)
  - [ ] Artist name
  - [ ] Year (if available)
  - [ ] List of all album songs
  - [ ] Song count

**Notes:** ___________________________________________

### Test AL3: Play All Album Songs
**Objective:** "Phát tất cả" button plays album from start

**Steps:**
1. [ ] On album detail screen
2. [ ] Tap "Phát tất cả" button

**Expected Results:**
- [ ] First album song plays
- [ ] MiniPlayer shows current song
- [ ] Songs can be skipped through album order
- [ ] All album songs in queue

**Notes:** ___________________________________________

### Test AL4: Click Individual Album Song
**Objective:** Can select specific song from album

**Steps:**
1. [ ] On album detail screen
2. [ ] Tap any song (not the first)

**Expected Results:**
- [ ] Selected song plays
- [ ] MiniPlayer updates
- [ ] Remaining album songs in queue after selected song
- [ ] Song row highlighted

**Notes:** ___________________________________________

### Test AL5: Album with No Songs
**Objective:** Handle albums that have no songs

**Steps:**
1. [ ] Look for album with no songs (if available)
2. [ ] Tap to view detail

**Expected Results:**
- [ ] Detail loads without crash
- [ ] Shows "0 bài hát" or empty songs list
- [ ] "Phát tất cả" button not shown or disabled
- [ ] No error messages

**Notes:** ___________________________________________

### Test AL6: Verify Album Song Metadata
**Objective:** Album songs show correct information

**Steps:**
1. [ ] On any album detail screen
2. [ ] Look at song list items

**Expected Results:**
- [ ] Each song shows:
  - [ ] Song index/number (01, 02, etc.)
  - [ ] Song image/thumbnail
  - [ ] Song title
  - [ ] Artist name
  - [ ] Duration (if available)

**Notes:** ___________________________________________

---

## SECTION 6: EDGE CASES & ERROR HANDLING

### Test E1: Network Error - Album Loading Fails
**Objective:** App handles network errors gracefully

**Steps:**
1. [ ] Put device in airplane mode
2. [ ] Try to navigate to Albums tab

**Expected Results:**
- [ ] Shows error message or empty state
- [ ] Doesn't crash
- [ ] Shows user-friendly message
- [ ] No crash on retry

**Notes:** ___________________________________________

### Test E2: Recover from Network Error
**Objective:** App recovers when network restored

**Steps:**
1. [ ] With airplane mode on, try loading albums
2. [ ] Turn off airplane mode
3. [ ] Refresh or navigate again

**Expected Results:**
- [ ] Albums load successfully when network back
- [ ] Data displays correctly
- [ ] No residual errors

**Notes:** ___________________________________________

### Test E3: Rapid Navigation
**Objective:** App handles fast navigation between screens

**Steps:**
1. [ ] Tap Library > Playlists
2. [ ] Tap a playlist
3. [ ] Go back to Library
4. [ ] Tap Albums
5. [ ] Tap an album
6. [ ] Repeat 5-10 times rapidly

**Expected Results:**
- [ ] No crashes or freezing
- [ ] Smooth transitions
- [ ] No memory issues
- [ ] UI remains responsive

**Notes:** ___________________________________________

### Test E4: Invalid/Missing Data
**Objective:** App handles incomplete data

**Steps:**
1. [ ] Navigate through various albums/playlists
2. [ ] Look for ones with missing fields

**Expected Results:**
- [ ] Graceful handling of missing fields
- [ ] Placeholders shown (default images, N/A, etc.)
- [ ] No crashes or "undefined" shown in UI

**Notes:** ___________________________________________

---

## SECTION 7: PLAYER INTEGRATION TESTS

### Test PL1: Player Shows Current Song
**Objective:** MiniPlayer correctly displays current song

**Steps:**
1. [ ] From playlist or album, tap to play a song
2. [ ] Observe MiniPlayer (bottom of screen)

**Expected Results:**
- [ ] MiniPlayer shows:
  - [ ] Song title
  - [ ] Artist name
  - [ ] Album/playlist cover
  - [ ] Play/pause button
  - [ ] Progress bar
- [ ] Information accurate and up-to-date

**Notes:** ___________________________________________

### Test PL2: Player Persists During Navigation
**Objective:** Playing doesn't stop when navigating

**Steps:**
1. [ ] Start playing a song
2. [ ] Navigate between library tabs
3. [ ] Navigate to different playlists/albums

**Expected Results:**
- [ ] Song continues playing
- [ ] MiniPlayer visible throughout
- [ ] Player state maintained

**Notes:** ___________________________________________

### Test PL3: Queue Management
**Objective:** Songs play in correct order

**Steps:**
1. [ ] Play playlist or album
2. [ ] Let it play through several songs or skip ahead

**Expected Results:**
- [ ] Songs play in correct order
- [ ] Skipping works
- [ ] Next/previous buttons work
- [ ] Queue reflects current position

**Notes:** ___________________________________________

---

## SECTION 8: UI/UX TESTS

### Test UI1: Responsive Layout
**Objective:** UI adapts to different screen sizes

**Steps:**
1. [ ] Rotate device (portrait/landscape)
2. [ ] Verify all elements visible and properly laid out

**Expected Results:**
- [ ] No overlapping elements
- [ ] Text readable
- [ ] Buttons accessible
- [ ] Images scale properly

**Notes:** ___________________________________________

### Test UI2: Loading States
**Objective:** Loading indicators show/hide properly

**Steps:**
1. [ ] Navigate to playlist/album detail
2. [ ] Observe loading indicator

**Expected Results:**
- [ ] Loading spinner shows briefly
- [ ] Hides when data arrives
- [ ] Smooth transition
- [ ] Content shows after loading

**Notes:** ___________________________________________

### Test UI3: Visual Consistency
**Objective:** UI matches design system

**Steps:**
1. [ ] View various screens
2. [ ] Check color consistency, spacing, fonts

**Expected Results:**
- [ ] Consistent colors throughout
- [ ] Proper spacing between elements
- [ ] Typography matches
- [ ] Visual hierarchy clear

**Notes:** ___________________________________________

---

## SECTION 9: PERFORMANCE TESTS

### Test PERF1: App Launch Time
**Objective:** App starts quickly

**Steps:**
1. [ ] Close app completely
2. [ ] Reopen app
3. [ ] Note time to reach main screen

**Expected Results:**
- [ ] App starts in < 3 seconds
- [ ] No freezing or lag
- [ ] Smooth loading

**Notes:** ___________________________________________

### Test PERF2: Library Load Time
**Objective:** Playlists/Albums load quickly

**Steps:**
1. [ ] Tap Library tab
2. [ ] Note time for content to appear
3. [ ] Scroll through list

**Expected Results:**
- [ ] Content visible within 1-2 seconds
- [ ] Smooth scrolling, no lag
- [ ] No frame drops

**Notes:** ___________________________________________

### Test PERF3: Detail Screen Load Time
**Objective:** Playlist/Album detail loads quickly

**Steps:**
1. [ ] Tap on playlist/album
2. [ ] Note time for detail to appear

**Expected Results:**
- [ ] Detail visible within 1 second
- [ ] Songs list loads without lag
- [ ] Smooth scrolling

**Notes:** ___________________________________________

### Test PERF4: No Memory Leaks
**Objective:** App memory usage stable

**Steps:**
1. [ ] Monitor device memory
2. [ ] Navigate between screens 20+ times
3. [ ] Observe memory usage

**Expected Results:**
- [ ] Memory usage remains relatively stable
- [ ] No significant increase after navigation
- [ ] No crashes from memory issues

**Notes:** ___________________________________________

---

## SECTION 10: ACCESSIBILITY TESTS

### Test ACC1: Text Readability
**Objective:** Text is readable on all screens

**Steps:**
1. [ ] View each screen
2. [ ] Check text contrast and size

**Expected Results:**
- [ ] Text readable in normal lighting
- [ ] Good contrast against backgrounds
- [ ] Font size appropriate

**Notes:** ___________________________________________

### Test ACC2: Touch Targets
**Objective:** All buttons/interactive elements easily tappable

**Steps:**
1. [ ] Try tapping all buttons
2. [ ] Ensure touch area is sufficient

**Expected Results:**
- [ ] All buttons easily tappable
- [ ] Minimum 44x44pt touch target
- [ ] No accidental taps

**Notes:** ___________________________________________

---

## FINAL SUMMARY

### Critical Issues Found
- [ ] None (if checked, list below):
  ___________________________________________________________
  ___________________________________________________________

### Minor Issues Found
- [ ] None (if found, list below):
  ___________________________________________________________
  ___________________________________________________________

### Recommendations
- [ ] None (if any, list below):
  ___________________________________________________________
  ___________________________________________________________

### Overall Assessment
- [ ] ✅ READY FOR PRODUCTION
- [ ] ⚠️ READY WITH MINOR FIXES
- [ ] ❌ NOT READY - REQUIRES FIXES

**Tester Signature:** ___________________________

**Date:** ___________________________

**Additional Notes:**
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

## QUICK REFERENCE: API ENDPOINTS BEING TESTED

```
Authentication:
  POST /auth/register       - Create new user
  POST /auth/login          - User login

Playlists:
  GET  /playlists           - Get user's playlists (auth required)
  POST /playlists           - Create playlist (auth required)
  GET  /playlists/:id       - Get playlist detail (auth required)
  PUT  /playlists/:id       - Update playlist (auth required)
  DELETE /playlists/:id     - Delete playlist (auth required)
  POST /playlists/:id/songs - Add song to playlist (auth required)

Albums:
  GET  /albums              - Get all albums (public)
  GET  /albums/:id          - Get album detail (public)
```

---

**Last Updated:** 2024  
**Version:** 1.0
