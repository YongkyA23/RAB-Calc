export const TIME_RULES = {
  a3DuplexPerMinute: 8,
  a3SimplexPerMinute: 15,
  meterMinutesPerM2: 10,
  businessCardSheetsPerBox: 20,
  businessCardSheetsPerMinute: 15,
  bookSheetsPerMinute: 10,
  saddleMinutesPerCopy: 1.5,
  perfectMinutesPerCopy: 3,
  hardCoverMinutesPerCopy: 8,
}

export const FINISHING_RULES = {
  laminate: { setup: 30, sheetsPerMinute: 15 },
  secondRoll: { min: 15, max: 20 },
  standardCut: { setup: 30, minPerSheet: 3, maxPerSheet: 5 },
  customCut: { setup: 30, minPerSheet: 5, maxPerSheet: 8 },
  dieCut: { minSetup: 45, maxSetup: 60, minPerSheet: 2, maxPerSheet: 3 },
  kissCut: { minSetup: 30, maxSetup: 45, minPerSheet: 2, maxPerSheet: 3 },
}

