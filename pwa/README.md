# PediTrack - Pediatric Symptom Tracker

A privacy-focused Progressive Web App (PWA) for tracking pediatric symptoms without collecting any personal identifying information (PHI). Helps parents document illness progression and generate professional medical summaries for healthcare visits.

![PediTrack Icon](icons/icon-192.png)

## Features

### Privacy-First Design
- **HIPAA Safe Harbor Compliant**: No collection of identifying information
- **100% Local Storage**: All data stored in browser using IndexedDB
- **No Cloud Sync**: Your data never leaves your device
- **Offline Capable**: Full functionality without internet connection
- **No Analytics**: Zero tracking or external data collection

### Multi-Child Management
- Track multiple children separately with unique profiles
- Choose from 20+ heroicons to represent each child
- Customizable icon colors
- Easy switching between child profiles

### Comprehensive Symptom Tracking
- Quick-entry interface for 13 common symptoms:
  - Fever, Cough, Runny Nose, Congestion
  - Vomiting, Diarrhea, Rash, Ear Pain
  - Sore Throat, Difficulty Breathing
  - Lethargy, Irritability, Loss of Appetite
- Severity levels (mild/moderate/severe) with color coding
- Custom symptom entries
- Timestamp tracking with resolution marking
- Optional notes for each symptom

### Vital Signs Monitoring
- **Temperature**: F/C toggle, multiple measurement methods (oral, rectal, temporal, axillary)
- **Breathing**: Difficulty assessment (normal to severe)
- **Hydration**: Wet diaper tracking, fluid intake logging
- **Food Intake**: Eating patterns (normal, reduced, refusing)
- **Sleep**: Duration and quality tracking

### Interventions & Medications
- **Medication Logging**:
  - Common types: Tylenol/Acetaminophen, Motrin/Ibuprofen, Antibiotics
  - Dose tracking (as prescribed by healthcare provider)
  - Medication timing helper to prevent double-dosing
  - Automatic warnings if dosing too soon
- **Non-Medication Treatments**:
  - Albuterol/Nebulizer, Nasal Suctioning
  - Humidifier, Cooling Measures
- **Effectiveness Tracking**: Log how well interventions worked

### Medical Summary Generation
- Auto-generates professional HPI (History of Present Illness)
- Includes: chief complaint, onset, symptom progression, vitals, interventions
- Real-time updates as data is added
- De-identified format (no names used)
- Copy to clipboard or export as PDF/text

### Visual Data Presentation
- **Timeline View**: Chronological display of all events
- **Temperature Chart**: Line graph with normal range and fever threshold indicators
- **Symptom Duration**: Visual representation of active symptoms
- **Daily Summaries**: Key events organized by day
- **Intervention Effectiveness**: Color-coded outcomes

### PWA Capabilities
- Installable to home screen (iOS, Android, Desktop)
- Works completely offline after first load
- Fast load times (<3s on 3G)
- Responsive mobile-first design
- Standalone app mode (no browser chrome)

### Data Management
- Export illness episodes as PDF or text files
- Archive completed episodes
- Complete data clearing for privacy
- JSON backup export option

## Installation

### As a PWA (Recommended)

#### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

#### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home Screen"
4. Tap "Install"

#### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Click the install icon in the address bar
3. Click "Install"

### GitHub Pages Deployment

This app is designed for deployment on GitHub Pages:

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch, root directory (or `/pwa` folder)
4. Access at `https://[username].github.io/[repository-name]/pwa/`

**Note**: Update the `start_url` in `manifest.json` to match your GitHub Pages URL.

## Usage

### Getting Started
1. **Add a Child**: Click "Add Child" to create a profile with a nickname and icon
2. **Start Tracking**: An illness episode is automatically created for each child
3. **Log  Data**: Use the "Log Entry" section to track symptoms, vitals, and interventions
4. **View Summary**: Check the "Summary" section for the auto-generated medical report

### Best Practices
- Log temperature regularly during fever episodes
- Mark resolved symptoms when they improve
- Track medication times to prevent double-dosing
- Add notes for context (e.g., "woke up crying", "refused dinner")
- Export summary before doctor visits

### Privacy & Security
- **No Real Names Required**: Use nicknames like "Kiddo" or "Little One"
- **Local Data Only**: All information stays on your device
- **Regular Exports**: Save PDF/text exports for your records
- **Clear Data**: Option to completely wipe all data when needed

## Technical Details

### Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: IndexedDB for local storage
- **Charts**: Chart.js for visualizations
- **PDF Export**: jsPDF library
- **Icons**: Heroicons (via CDN)
- **PWA**: Service Worker for offline capability

### Browser Compatibility
- Chrome 90+ (Desktop & Android)
- Safari 14+ (iOS & macOS)
- Firefox 88+
- Edge 90+

### Data Structure
The app uses 5 IndexedDB object stores:
- `children`: Child profiles
- `episodes`: Illness episodes
- `symptoms`: Symptom entries
- `vitals`: Vital sign measurements
- `interventions`: Medications and treatments

## Medical Disclaimer

**IMPORTANT**: This app is for tracking purposes only and does not provide medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare providers for medical decisions. 

This app:
- ❌ Does NOT replace professional medical care
- ❌ Does NOT provide dosing calculators
- ❌ Does NOT offer AI diagnosis
- ✅ DOES help organize illness information
- ✅ DOES generate summaries for healthcare visits

## Privacy & HIPAA Compliance

PediTrack follows **HIPAA Safe Harbor** principles by design:

- No names, addresses, or contact information
- No dates of birth (ages not required)
- No medical record numbers
- No account numbers or identifiers
- No biometric identifiers
- No photos or images

All tracking is done using:
- Nicknames or generic identifiers
- Relative time references (days ago, hours)
- General age descriptors ("child", "patient")

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Acknowledgments

- Built with accessibility and privacy as core principles
- Inspired by the need for better pediatric illness tracking
- Icons by [Heroicons](https://heroicons.com/)
- Charts by [Chart.js](https://www.chartjs.org/)

## Version History

### v1.0 (December 2025)
- Initial release
- Multi-child management
- Comprehensive symptom tracking
- Vital signs monitoring
- Medication/intervention logging
- Medical summary generation
- Timeline and chart visualizations
- PWA support with offline capability
- PDF/text export functionality

---

**Made with ❤️ for parents and caregivers**

Remember: This is a tool to help you remember and communicate. Always seek professional medical care when your child is ill.
