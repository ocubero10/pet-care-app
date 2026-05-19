// Branding centralized so swapping the company logo / name only requires
// editing this file.
//
// To use a real logo image:
//  1. Drop your logo file into  pet-care-app/assets/logo.png
//  2. Uncomment the require() line below (and remove the `null` line).

import type { ImageSourcePropType } from 'react-native';

export const BRAND_NAME = 'Liz & Pets';
export const BRAND_TAGLINE = 'Servicios de grooming y cuidado';

export const BRAND_LOGO: ImageSourcePropType = require('../../assets/logo.png');
