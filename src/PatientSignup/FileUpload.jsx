import React, { useState } from 'react'

const FileUpload = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({})

  const handleFileChange = e => {
    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      status: 'uploading'
    }))
    setFiles([...files, ...newFiles])
  }

  const uploadFiles = () => {
    setUploading(true)
    files.forEach((fileObj, index) => {
      // Simulate file upload
      const interval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          [index]: prev[index] ? prev[index] + 10 : 10
        }))
        if (progress[index] >= 100) {
          clearInterval(interval)
          fileObj.status = 'uploaded'
          setUploading(false)
        }
      }, 300)
    })
  }

  const renderFileIcon = file => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className='w-12 h-12 object-cover rounded'
        />
      )
    }
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='w-12 h-12 text-gray-400'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
        <polyline points='14 2 14 8 20 8' />
        <line x1='16' y1='13' x2='8' y2='13' />
        <line x1='16' y1='17' x2='8' y2='17' />
        <polyline points='10 9 9 9 8 9' />
      </svg>
    )
  }

  return (
    <div className='flex justify-center items-center0 p-4 rounded-md'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl'>
        <h2 className='text-2xl font-bold mb-4'>Upload or Attach Files</h2>
        <p className='text-gray-500 mb-4'>Upload requested document here...</p>
        <div className='border-2 border-dashed border-blue-400 p-4 rounded-lg text-center mb-4 h-[8rem] lg:h-[12rem] flex items-center justify-center'>
          <input
            type='file'
            multiple
            onChange={handleFileChange}
            className='hidden'
            id='file-input'
          />
          <label
            htmlFor='file-input'
            className='cursor-pointer text-blue-800 flex flex-col items-center'
          >
            <span>
              Browse <span className='text-blue-400'>files or</span>
            </span>
            <span className='text-blue-400'>
              Drag and drop your files
              <span className='text-blue-800'> here</span>
            </span>
          </label>
        </div>
        <p className='text-gray-400 mt-2'>
          Only jpegs & pdf files. <span className='mr-12'></span> Max file: 10mb
        </p>
        <div className='mb-4'>
          {files.map((fileObj, index) => (
            <div
              key={index}
              className='flex flex-col md:flex-row items-center justify-between mb-2 border p-2 rounded-lg bg-gray-50'
            >
              <div className='flex items-center space-x-4 mb-2 md:mb-0'>
                {renderFileIcon(fileObj.file)}
                <span className='text-sm md:text-base'>
                  {fileObj.file.name}
                </span>
              </div>
              <div className='flex items-center w-full md:w-auto space-x-2'>
                {fileObj.status === 'uploading' && (
                  <div className='w-full md:w-48 h-2 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-blue-600'
                      style={{ width: `${Math.min(progress[index], 100)}%` }}
                    ></div>
                  </div>
                )}
                {fileObj.status === 'uploaded' && (
                  <div className='flex items-center space-x-2'>
                    <span className='text-green-600'>Uploaded</span>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={2}
                      stroke='currentColor'
                      className='w-5 h-5 text-green-600'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                )}
                {fileObj.status === 'failed' && (
                  <div className='text-red-600'>Upload failed</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className='flex justify-between mb-6'>
          <button
            className='bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100'
            onClick={() => setFiles([])}
          >
            Discard
          </button>
          <button
            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
            onClick={uploadFiles}
          >
            Submit files
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
