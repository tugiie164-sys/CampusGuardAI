/**
 * Campus Locations Seed Configuration
 * 6 Core Academic & Residential Complexes
 */
import { Location } from '../shared/types.js';

export const CAMPUS_LOCATIONS: Location[] = [
  {
    id: 'BLK-A',
    name: 'Block A · Administration & Core',
    shortCode: 'Block A',
    floors: [1, 2, 3],
    description: 'Chancellery, Core Data Center, NOC & Radius Auth',
  },
  {
    id: 'BLK-B',
    name: 'Block B · Engineering & IoT Labs',
    shortCode: 'Block B',
    floors: [1, 2, 3, 4],
    description: 'Robotics, Embedded Systems, Smart Auditoriums',
  },
  {
    id: 'BLK-C',
    name: 'Block C · Computer Science & ICT Complex',
    shortCode: 'Block C',
    floors: [1, 2, 3, 4],
    description: 'ICT Labs 1–6, Lecture Theatres, High-Density Wi-Fi',
  },
  {
    id: 'LIB',
    name: 'Central Library & Learning Commons',
    shortCode: 'Library',
    floors: [1, 2, 3],
    description: '24/7 Study Atrium, Digital Archive, Research Pods',
  },
  {
    id: 'RES-N',
    name: 'North Student Residences',
    shortCode: 'North Hall',
    floors: [1, 2, 3, 4, 5],
    description: 'Student Residence Flats, Evening Streaming Peak',
  },
  {
    id: 'SCI',
    name: 'Science & Environmental Complex',
    shortCode: 'Science',
    floors: [1, 2, 3],
    description: 'Biotech Labs, Cleanrooms, HVAC/CO2 Telemetry',
  },
];
