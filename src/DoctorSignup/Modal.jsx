import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure
} from '@nextui-org/react'
import FileUpload from './FileUpload'

export default function App () {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [modalSize, setModalSize] = useState('md')

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setModalSize('4xl')
      } else {
        setModalSize('md')
      }
    }

    window.addEventListener('resize', handleResize)

    // Call the function to set the initial size
    handleResize()

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <Button
        onPress={onOpen}
        className='p-0 m-0 border-none bg-transparent shadow-none h-full'
      >
        <a href='#' className='text-sm font-medium text-gray-900 mr-24 lg:mr-0 mt-3 lg:mt-0 lg:mb-0'>
          Click here to <span className='text-violet-950'>upload</span>{' '}
          Documents →
        </a>
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement='auto'
        scrollBehavior='inside'
        className='bg-gray-100 rounded-lg'
        size={modalSize}
      >
        <ModalContent>
          {onClose => (
            <>
              {/* <ModalHeader className='flex flex-col gap-1'>
                Modal Title
              </ModalHeader> */}
              <ModalBody>
                <FileUpload />
              </ModalBody>
              <ModalFooter>
                {/* <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button> */}
                <Button
                  color='primary'
                  className='bg-[#6f4ef2] rounded-lg shadow-lg shadow-indigo-500/20'
                  onPress={onClose}
                >
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
