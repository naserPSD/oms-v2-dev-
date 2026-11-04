Usage Examples
Here's how to use the button component with different variants:

Basic Buttons

<Button>Default</Button>
<Button variant="alternative">Alternative</Button>
<Button variant="dark">Dark</Button>
<Button variant="light">Light</Button>
<Button variant="green">Green</Button>
<Button variant="red">Red</Button>
<Button variant="yellow">Yellow</Button>
<Button variant="purple">Purple</Button>
Outline Buttons

<Button variant="outline-blue">Blue Outline</Button>
<Button variant="outline-gray">Gray Outline</Button>
<Button variant="outline-green">Green Outline</Button>
<Button variant="outline-red">Red Outline</Button>
<Button variant="outline-yellow">Yellow Outline</Button>
<Button variant="outline-purple">Purple Outline</Button>
Gradient Buttons

<Button gradient variant="blue">Blue Gradient</Button>
<Button gradient variant="green">Green Gradient</Button>
<Button gradient variant="cyan">Cyan Gradient</Button>
<Button gradient variant="teal">Teal Gradient</Button>
<Button gradient variant="lime">Lime Gradient</Button>
<Button gradient variant="red">Red Gradient</Button>
<Button gradient variant="pink">Pink Gradient</Button>
<Button gradient variant="purple">Purple Gradient</Button>
Social Buttons

<Button variant="social-facebook" icon={<FacebookIcon />}>Sign in with Facebook</Button>
<Button variant="social-twitter" icon={<TwitterIcon />}>Sign in with Twitter</Button>
<Button variant="social-github" icon={<GithubIcon />}>Sign in with Github</Button>
<Button variant="social-google" icon={<GoogleIcon />}>Sign in with Google</Button>
<Button variant="social-apple" icon={<AppleIcon />}>Sign in with Apple</Button>
Payment Buttons

<Button variant="social-bitcoin" icon={<BitcoinIcon />}>Pay with Bitcoin</Button>
<Button variant="social-paypal" icon={<PaypalIcon />}>Check out with PayPal</Button>
<Button variant="social-applePay" icon={<AppleIcon />}>Check out with Apple Pay</Button>
<Button variant="social-amex" icon={<AmexIcon />}>Pay with American Express</Button>
<Button variant="social-visa" icon={<VisaIcon />}>Pay with Visa</Button>
<Button variant="social-mastercard" icon={<MastercardIcon />}>Pay with MasterCard</Button>
<Button variant="social-ethereum" icon={<EthereumIcon />}>Pay with Ethereum</Button>
Bordered Gradient Buttons

<Button variant="borderedGradient-purpleToBlue">Purple to Blue</Button>
<Button variant="borderedGradient-cyanToBlue">Cyan to Blue</Button>
<Button variant="borderedGradient-greenToBlue">Green to Blue</Button>
<Button variant="borderedGradient-purpleToPink">Purple to Pink</Button>
<Button variant="borderedGradient-pinkToOrange">Pink to Orange</Button>
<Button variant="borderedGradient-tealToLime">Teal to Lime</Button>
<Button variant="borderedGradient-redToYellow">Red to Yellow</Button>
Button Sizes

<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="base">Base</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra large</Button>
Buttons with Icons

<Button icon={<CartIcon />}>Buy now</Button>
<Button icon={<ArrowIcon />} iconPosition="right">Choose plan</Button>
Buttons with Badges

<Button badge="2">Messages</Button>
Icon Buttons

<Button icon={<ArrowIcon />} size="icon" />
<Button icon={<ArrowIcon />} size="icon" rounded="full" />
<Button icon={<LikeIcon />} variant="outline-blue" size="icon" />
<Button icon={<LikeIcon />} variant="outline-blue" size="icon" rounded="full" />
Loading Buttons

<Button loading>Loading...</Button>
<Button variant="alternative" loading>Loading...</Button>
Disabled Buttons

<Button disabled>Disabled button</Button>