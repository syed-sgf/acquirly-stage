export default function StageWatermark(){
  const env=process.env.NEXT_PUBLIC_APP_ENV??"prod";
  if(env!=="stage")return null;
  return(<div aria-hidden className="pointer-events-none fixed inset-0 z-40 select-none"
    style={{backgroundImage:"repeating-linear-gradient(45deg, rgba(201,162,39,0.09) 0 40px, transparent 40px 80px)"}}/>);
}
