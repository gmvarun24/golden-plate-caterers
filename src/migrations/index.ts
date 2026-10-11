import * as migration_20261010_173500_initial from './20261010_173500_initial'
import * as migration_20261011_041156_catalogue_and_enquiries from './20261011_041156_catalogue_and_enquiries'
import * as migration_20261011_043823_enquiry_flow from './20261011_043823_enquiry_flow'
import * as migration_20261011_142912_media_storage_fields from './20261011_142912_media_storage_fields'
import * as migration_20261011_173956_site_hero_image from './20261011_173956_site_hero_image'

export const migrations = [
  {
    up: migration_20261010_173500_initial.up,
    down: migration_20261010_173500_initial.down,
    name: '20261010_173500_initial',
  },
  {
    up: migration_20261011_041156_catalogue_and_enquiries.up,
    down: migration_20261011_041156_catalogue_and_enquiries.down,
    name: '20261011_041156_catalogue_and_enquiries',
  },
  {
    up: migration_20261011_043823_enquiry_flow.up,
    down: migration_20261011_043823_enquiry_flow.down,
    name: '20261011_043823_enquiry_flow',
  },
  {
    up: migration_20261011_142912_media_storage_fields.up,
    down: migration_20261011_142912_media_storage_fields.down,
    name: '20261011_142912_media_storage_fields',
  },
  {
    up: migration_20261011_173956_site_hero_image.up,
    down: migration_20261011_173956_site_hero_image.down,
    name: '20261011_173956_site_hero_image',
  },
]
