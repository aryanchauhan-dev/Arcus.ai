import React from 'react'
import { industries } from "@/data/industries"

type Industry = (typeof industries)[number];

type Props = {
  industries: Industry[];
}

const OnboardingForm = ({ industries }: Props) => {
  return (
    <div>OnboardingForm</div>
  )
}

export default OnboardingForm;