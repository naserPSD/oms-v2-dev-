'use client'
import Image from "next/image";
import { useState } from "react";

const TestDesign = () => {
  const [activeTab, setActiveTab] = useState('one')

  const selectTab = (params) => {
    setActiveTab(params)
  }


  return (
    <>
      <div className="bg-pink-200 h-full pt-6 pb-12">
        <div className="grid grid-row-2 justify-center items-center gap-0">

          <div className="relative h-100 w-300">

            <img src="images/Room (2).jpg" className=" relative h-100 w-300 z-0" />
            <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  border-1 border-gray-300 p-2 hover:scale-105 transition-all  duration-500"><h1 className="text-[25px] font-semibold">YOUR RESERVATION</h1></button>


          </div>


          {activeTab == 'one' && (
            <div className=" h-100 w-300 bg-blue-950 p-15">
              <div className=" grid grid-cols-3 gap-4">
                <div className={`border-l-2 p-2 ${activeTab == 'one' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('one')} className={`cursor-pointer ${activeTab == 'one' ? 'text-amber-300' : ''}`}>1. Choosen Data</button></div>
                <div className="p-2 border-b-1 border-white gap-2 "> Check in :
                  <input type="number" className="focus:outline-none pl-2  w-65" />
                </div>
                <div className="p-2 border-b-1 border-white ">Check Out :<input type="number" className="focus:outline-none pl-2  w-60" /></div>
                <div className={`border-l-2 p-2 ${activeTab == 'two' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('two')} className={`cursor-pointer ${activeTab == 'two' ? 'text-amber-300' : ''}`} >2. Choosen Room</button></div>
                <div className="p-2 border-b-1 border-white "> Duration:<input type="number" className="focus:outline-none pl-2  w-65" /></div>
                <div className="p-2 border-b-1 border-white ">Room : <input type="number" className="focus:outline-none pl-2  w-65" /></div>
                <div className={`border-l-2 p-2 ${activeTab == 'three' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('three')} className={`cursor-pointer ${activeTab == 'three' ? 'text-amber-300' : ''}`}>3.Make a Reservation</button></div>
                <div className="col-span-2 start-col-2 row-span-2 start-row-3 mx-auto p-4 pt-10">
                  <button className="bg-amber-300 rounded-3xl text-black p-2 font-bold hover:scale-105 transition-all duration-500">BOOK NOW →</button>
                </div>
                <div className={`border-l-2 p-2 ${activeTab == 'four' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('four')} className={`cursor-pointer ${activeTab == 'four' ? 'text-amber-300' : ''}`}>4.Confirmation</button></div>


              </div>

            </div>


          )}

          {activeTab == 'two' && (
            <div className=" h-100 w-300 bg-blue-950 p-15">
              <div className=" grid grid-cols-3 gap-4">
                <div className={`border-l-2 p-2 ${activeTab == 'one' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('one')} className={`cursor-pointer ${activeTab == 'one' ? 'text-amber-300' : ''}`}>1. Choosen Data</button></div>
                <div className="p-2 border-b-1 border-white gap-2 "> First Floor :

                </div>
                <div className="p-2 border-b-1 border-white ">Second Floor :</div>
                <div className={`border-l-2 p-2 ${activeTab == 'two' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('two')} className={`cursor-pointer ${activeTab == 'two' ? 'text-amber-300' : ''}`} >2. Choosen Room</button></div>
                <div className="p-2 border-b-1 border-white "> Third Floor:</div>
                <div className="p-2 border-b-1 border-white ">Forth Floor:</div>
                <div className={`border-l-2 p-2 ${activeTab == 'three' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('three')} className={`cursor-pointer ${activeTab == 'three' ? 'text-amber-300' : ''}`}>3.Make a Reservation</button></div>
                <div className="col-span-2 start-col-2 row-span-2 start-row-3 mx-auto p-4 pt-10">
                  <button className="bg-amber-300 rounded-3xl text-black p-2 font-bold hover:scale-105 transition-all duration-500">BOOK NOW →</button>
                </div>
                <div className={`border-l-2 p-2 ${activeTab == 'four' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('four')} className={`cursor-pointer ${activeTab == 'four' ? 'text-amber-300' : ''}`}>4.Confirmation</button></div>


              </div>

            </div>

          )}

          {activeTab == 'three' && (
            <div className=" h-100 w-300 bg-blue-950 p-15">
              <div className=" grid grid-cols-3 gap-4">
                <div className={`border-l-2 p-2 ${activeTab == 'one' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('one')} className={`cursor-pointer ${activeTab == 'one' ? 'text-amber-300' : ''}`}>1. Choosen Data</button></div>
                <div className="p-2 border-b-1 border-white gap-2 "> Name :</div>
                <div className="p-2 border-b-1 border-white ">Address:</div>
                <div className={`border-l-2 p-2 ${activeTab == 'two' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('two')} className={`cursor-pointer ${activeTab == 'two' ? 'text-amber-300' : ''}`} >2. Choosen Room</button></div>
                <div className="p-2 border-b-1 border-white "> Phone Number:</div>
                <div className="p-2 border-b-1 border-white "> Email:</div>
                <div className={`border-l-2 p-2 ${activeTab == 'three' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('three')} className={`cursor-pointer ${activeTab == 'three' ? 'text-amber-300' : ''}`}>3.Make a Reservation</button></div>
                <div className="col-span-2 start-col-2 row-span-2 start-row-3 mx-auto p-4 pt-10">
                  <button className="bg-amber-300 rounded-3xl text-black p-2 font-bold hover:scale-105 transition-all duration-500">BOOK NOW →</button>
                </div>
                <div className={`border-l-2 p-2 ${activeTab == 'four' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('four')} className={`cursor-pointer ${activeTab == 'four' ? 'text-amber-300' : ''}`}>4.Confirmation</button></div>


              </div>

            </div>

          )}

          {activeTab == 'four' && (
            <div className=" h-100 w-300 bg-blue-950 p-15">
              <div className=" grid grid-cols-3 gap-4">
                <div className={`border-l-2 p-2 ${activeTab == 'one' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('one')} className={`cursor-pointer ${activeTab == 'one' ? 'text-amber-300' : ''}`}>1. Choosen Data</button></div>
                <div className="p-2 border-b-1 border-white gap-2 "> Check in :</div>
                <div className="p-2 border-b-1 border-white ">Check Out :</div>
                <div className={`border-l-2 p-2 ${activeTab == 'two' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('two')} className={`cursor-pointer ${activeTab == 'two' ? 'text-amber-300' : ''}`} >2. Choosen Room</button></div>
                <div className="p-2 border-b-1 border-white "> Duration:</div>
                <div className="p-2 border-b-1 border-white ">Room :</div>
                <div className={`border-l-2 p-2 ${activeTab == 'three' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('three')} className={`cursor-pointer ${activeTab == 'three' ? 'text-amber-300' : ''}`}>3.Make a Reservation</button></div>
                <div className="col-span-2 start-col-2 row-span-2 start-row-3 mx-auto p-4 pt-10">
                  <button className="bg-amber-300 rounded-3xl text-black p-2 font-bold hover:scale-105 transition-all duration-500">BOOK NOW →</button>
                </div>
                <div className={`border-l-2 p-2 ${activeTab == 'four' ? 'text-amber-300' : 'text-white'}`}><button onClick={() => selectTab('four')} className={`cursor-pointer ${activeTab == 'four' ? 'text-amber-300' : ''}`}>4.Confirmation</button></div>


              </div>

            </div>

          )}


        </div>

      </div>

    </>

  );
}
export default TestDesign;