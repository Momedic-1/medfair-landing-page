import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react'

export default function SpecialistModal ({ isOpen,onClose, onOpenChange }) {
    
    const specialists = ['Dentist', 'Orthopedic', 'Physiotherapist', 'Optician']

  const Specialist= ({name})=>{
    return <div key={name} className='bg-[#F8F8FF] text-[#020E7C] border border-none rounded font-bold text-[24px] h-14 grid item-center justify-center mt-4 pt-2'>
        {name}
    </div>
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement='auto'
        scrollBehavior='inside'
        className='bg-[#EBF3FF] rounded-lg'
      >
        <ModalContent>
            <>
              <ModalBody>
                {specialists.map((value, index)=>(
                    <Specialist name={value}/>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button
                  color='primary'
                  className='bg-[#6f4ef2] text-[#ffffff] rounded-lg shadow-lg shadow-indigo-500/20'
                  onPress={()=>onClose(false)}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
        </ModalContent>
      </Modal>
    </>
  )
}
