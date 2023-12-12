import { ComboboxPopover } from '@/components/common/combobox-popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CameraIcon,
  DownloadIcon,
  StopIcon,
  VideoIcon,
} from '@radix-ui/react-icons';
import React from 'react';
import Webcam from 'react-webcam';

const WebcamContainer = () => {
  const webcamRef = React.useRef<Webcam>(null);
  const [videoConstraints, setVideoConstraints] =
    React.useState<MediaTrackConstraints>({
      width: 1280,
      height: 720,
      facingMode: 'environment',
    });
  const [deviceId, setDeviceId] = React.useState('');
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [mirrored, setMirrored] = React.useState(false);

  const mediaRecorderRef = React.useRef<MediaRecorder>();
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
  const [capturedPhotos, setCapturedPhotos] = React.useState<any[]>([]);
  const [capturedVideos, setCapturedVideos] = React.useState<any[]>([]);
  const [capturedVideoLength, setCapturedVideoLength] = React.useState(0);
  const capturedVideoLengthIntervalRef = React.useRef<any>();

  const handleDevices = React.useCallback(
    (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput')),
    [setDevices]
  );

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  React.useEffect(() => {
    if (!deviceId) return;
    setVideoConstraints((prev) => ({ ...prev, deviceId }));
  }, [deviceId]);

  const capturePhoto = React.useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedPhotos((prev) => [imageSrc, ...prev]);
  }, [webcamRef]);

  const handleStartCaptureVideo = React.useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.stream) return;
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    });
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );
    mediaRecorderRef.current.start();

    setCapturedVideoLength(0);
    capturedVideoLengthIntervalRef.current = setInterval(() => {
      setCapturedVideoLength((prev) => prev + 1);
    }, 1000);
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = React.useCallback(
    ({ data }: any) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = React.useCallback(() => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setCapturing(false);
    const newVideo = {
      url: URL.createObjectURL(
        new Blob(recordedChunks, {
          type: 'video/webm',
        })
      ),
      name: `capture_${new Date().getTime()}.webm`,
    };
    console.log(newVideo);

    setCapturedVideos((prev) => [newVideo, ...prev]);
    clearInterval(capturedVideoLengthIntervalRef.current);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = `capture_${new Date().getTime()}.webm`;
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <ComboboxPopover
          value={deviceId}
          options={devices.map((device) => ({
            value: device.deviceId,
            label: device.label,
          }))}
          onChange={(val) => setDeviceId(val)}
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id={'mirrored'}
            checked={mirrored}
            onCheckedChange={(checked) => {
              setMirrored(!mirrored);
            }}
          />
          <label
            htmlFor={'mirrored'}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mirrored
          </label>
        </div>
      </div>
      <Webcam
        height={720}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1280}
        videoConstraints={videoConstraints}
        mirrored={mirrored}
        audio={true}
        muted={true}
        disablePictureInPicture={false}
      />
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-center items-center">
          <Button variant={'outline'} size={'icon'} onClick={capturePhoto}>
            <CameraIcon />
          </Button>
          <Button
            variant={'outline'}
            size={'icon'}
            onClick={() => {
              if (capturing) {
                handleStopCaptureClick();
              } else {
                handleStartCaptureVideo();
              }
            }}
          >
            {capturing ? <StopIcon /> : <VideoIcon />}
          </Button>
          {capturing && <div>Recording: {capturedVideoLength}s</div>}
          {recordedChunks.length > 0 && (
            <Button variant={'outline'} size={'icon'} onClick={handleDownload}>
              <DownloadIcon />
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {capturedPhotos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold">Photos</h2>
            <div className="flex flex-wrap gap-2">
              {capturedPhotos.map((photo) => (
                <img
                  key={photo}
                  src={photo}
                  alt="captured"
                  className="w-32 h-32 object-cover"
                />
              ))}
            </div>
          </div>
        )}
        {capturedVideos.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold">Videos</h2>
            <div className="flex flex-wrap gap-2">
              {capturedVideos.map((video) => (
                <video
                  key={video.name}
                  controls
                  className="w-32 h-32 object-cover"
                >
                  <source src={video.url} type="video/webm" />
                </video>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamContainer;
