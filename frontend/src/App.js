import { useState } from 'react'
import './App.css'
import imageCompression from 'browser-image-compression'
import lamejs from 'lamejs'

function App() {

  // image state
  const [orgImage, setOrgImage] = useState('')
  const [orgImageFile, setOrgImageFile] = useState('')
  const [compressImage, setCompressImage] = useState('')
  const [imageFileName, setImageFileName] = useState('')

  // audio state
  const [audioFile, setAudioFile] = useState('')
  const [compressedAudio, setCompressedAudio] = useState('')

  // image handler
  const handleImage = (e) => {
    const imageFile = e.target.files[0]
    setOrgImage(imageFile)
    setOrgImageFile(URL.createObjectURL(imageFile))
    setImageFileName(imageFile.name)
  }

  // image compress method
  const handleImageCompress = (e) => {
    e.preventDefault()
    const options = {
      maxsizeMB : 1,
      maxWidthOrHeight : 500,
      useWebWorker: true
    }
    if (options.maxsizeMB >= orgImage/1024) {
      alert("Image too small for compress !")
      return 0
    }

    let output
    imageCompression(orgImage, options).then((x) => {
      output = x
      const downloadLink = URL.createObjectURL(output)
      setCompressImage(downloadLink)
    })
  }

  // audio compress method
  const handleAudio = (e) => {
    const file = e.target.files[0]
    setAudioFile(file)
  };

  const handleAudioCompress = (audioBuffer) => {
  const mp3Encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 64);
  const samples = audioBuffer.getChannelData(0);
  const sampleBlockSize = 1152;
  const mp3Data = [];

  try {
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const mp3Buffer = mp3Encoder.encodeBuffer(sampleChunk);
      if (mp3Buffer.length > 0) {
        mp3Data.push(mp3Buffer);
      }
    }

    const finalMp3Buffer = mp3Encoder.flush();
    if (finalMp3Buffer.length > 0) {
      mp3Data.push(finalMp3Buffer);
    }

    const mergedMp3Array = new Uint8Array(
      mp3Data.reduce((acc, val) => acc + val.length, 0)
    );

    let offset = 0;
    for (const mp3Buffer of mp3Data) {
      mergedMp3Array.set(mp3Buffer, offset);
      offset += mp3Buffer.length;
    }

    const blob = new Blob([mergedMp3Array], { type: "audio/mp3" });
    return blob;
  } catch (error) {
    console.error("Error compressing audio:", error);
    return null;
  }
};

  const handleAudioCompression = async () => {
    if (audioFile) {
      try {
        const audioContext = new window.AudioContext()
        const reader = new FileReader()
        reader.onload = async (event) => {
          const arrayBuffer = event.target.result
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          const compressedAudioBlob = handleAudioCompress(audioBuffer)
          setCompressedAudio(compressedAudioBlob)
        };
        reader.readAsArrayBuffer(audioFile)
      } catch (error) {
        console.log(error)
      }
    }
  };

  const handleDownloadAudio = () => {
    const url = URL.createObjectURL(compressedAudio)
    const link = document.createElement("a")
    link.href = url
    link.download = "compressed-audio.mp3"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
  <div className="App">
    {/* Image Compressor */}
    <h1>Image Compressor</h1>
    <div className='container'>
      <div className='preview'>
        {
          orgImageFile ? 
          (
          <img src={orgImageFile} width={500} height={300} alt='preview_original_image'/>
          ) 
          : (
          <img src='https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-6.png' alt='original_placeholder' />
          )
        }
      </div>
      <div className='menu mt-5'>
        <input
        type='file'
        accept='image/*'
        className='mt-2 btn btn-dark w-75'
        onChange={(e) => handleImage(e)}/>
        <br/>
        { orgImageFile && <button className='btn btn-primary mt-4' type='submit' onClick={(e) => {handleImageCompress(e)}}>Compress</button>}
        { compressImage && <a className='btn btn-warning mt-4 ms-4'href={compressImage}download={imageFileName}>Download</a>}
      </div>
      <div className='compressed'>
      {
          compressImage ? 
          (
          <img src={compressImage} width={500} height={300} alt='preview_compressed_image'/>
          ) 
          : (
          <img src='https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-6.png'alt='compressed_placeholder' />
          )
        }
      </div>
    </div>
    {/* Audio Compressor */}
    <h1>MP3 Compressor</h1>
    <div className='container'>
      <div className='preview'>
      {audioFile && (
          <audio controls>
            <source src={URL.createObjectURL(audioFile)} type="audio/mp3" />
          </audio>
        )}
      </div>
      <div className='menu'>
      <input type="file" accept="audio/*" className='mt-2 btn btn-dark w-75' onChange={handleAudio} />
      <br/>
        {audioFile && <button className='btn btn-primary mt-2' onClick={handleAudioCompression}>Compress Audio</button>}
        {compressedAudio && <button className='btn btn-warning mt-2 ms-2' onClick={handleDownloadAudio}>Download Audio</button>}
      </div>
      <div className='compressed'>
      {compressedAudio && (
            <audio controls>
              <source src={URL.createObjectURL(compressedAudio)} type="audio/mp3" />
            </audio>
        )}
      </div>
    </div>
  </div>
  )
}

export default App;