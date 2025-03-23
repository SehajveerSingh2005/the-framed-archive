export const states = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
]

export const verifyPinCode = async (pinCode: string) => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
    const data = await response.json()
    
    if (data[0].Status === 'Success') {
      const location = data[0].PostOffice[0]
      return {
        valid: true,
        city: location.District,
        state: location.State
      }
    }
    return { valid: false }
  } catch (error) {
    console.error('Error verifying PIN code:', error)
    return { valid: false }
  }
}