import Button from '../components/Button'
import Hero from '../components/Hero'
import InfoSection from '../components/InfoSection'

export default function Landing(props) {
    return (
        <main className="bg-ghost-white min-h-[90vh] flex flex-col justify-evenly">
            <Hero />
            <InfoSection />   
        </main>
    )
}

// * Old landing page
{/* <div className="grid grid-cols-2 gap-30 m-0">
  <h1 className="text-4xl font-bold m-5">{heading}</h1> 

  <img src="/WMS_image_logo.svg" alt="logo" className="col-span-1 justify-self-end md:hidden" />
  <img src="/wms_logo.svg" alt="logo" className="hidden md:block h-28 justify-self-center self-center row-span-2" />
  <p className="text-lg max-w-full font-bold m-5">{paragraph}</p>

  <Button text="Start booking" showicon={true} />
</div> */}