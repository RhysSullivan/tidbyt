import { useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { CC, resizeBase64Image } from '../utils/image';
import Marquee from "react-fast-marquee";

export const Animated = () => (
    <button type="button" className="bg-purple-900 w-full h-full text-white" disabled>
        <div className='flex flex-col items-center justify-center'>
            <Marquee
                speed={100}
                gradient={false}
            >
                <div style={{
                    width: '500px',
                }}>

                </div>
                <span className='text-4xl'>
                    Processing
                </span>

            </Marquee>
            <br />
            <ArrowPathIcon className='animate-spin w-20' width="64" height="64" />
        </div>
    </button>
)

const Capture = (
    {
        setTidbytImage,
        canvas,
        FPS,
        is_gif

    }: {
        setTidbytImage: (image: string | null) => void
        , canvas: HTMLCanvasElement | null,
        FPS: number,
        is_gif: boolean
    }
) => {
    const domEl = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(canvas);
    const getImage = async () => {
        if (!domEl.current) return;
        return await htmlToImage.toPng(domEl.current);
    }
    if (canvasRef.current !== canvas) {
        canvasRef.current = canvas;
    }


    useEffect(() => {
        const syncPreview = async (cnvs: HTMLCanvasElement | null) => {
            const dataUrl = await getImage();
            if (is_gif) {
                const frame = await getImage();
                if (!frame) {
                    return
                }
                const image = new Image();
                image.src = frame;
                image.crossOrigin = 'anonymous'
                image.onload = async () => {
                    if (!cnvs) {
                        console.log('no canvas')
                        return
                    }
                    console.log('rendering to canvas')
                    cnvs.getContext('2d')!.drawImage(image, 0, 0, cnvs.width, cnvs.height);
                    (await CC()).recordFrame();
                }
            } else {
                setTidbytImage(dataUrl ? await resizeBase64Image(dataUrl, 64, 32) : null)
            }
        }
        const interval = setInterval(() => syncPreview(canvasRef.current), 1000 / FPS);
        setTidbytImage(null);
        return () => {
            clearInterval(interval);
        };
    }, [FPS, is_gif, setTidbytImage, canvasRef]);

    return (

        <div ref={domEl} style={{
            width: '100%',
            height: '100%',

        }}  >
            {/* <img src='./push.png' /> */}
            {/* <img src='./push_64_32.png' /> */}
            {/* <img src="https://www.answeroverflow.com/content/branding/meta_header.png" /> */}
            {/* <h1 className='text-white text-9xl' >Large Text</h1> */}
            <Animated />
        </div>

    )

}

export default Capture