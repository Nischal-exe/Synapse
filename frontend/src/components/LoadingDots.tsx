export default function LoadingDots() {
    return (
        <div className="flex space-x-2.5 justify-center items-center h-full">
            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-duration:0.8s]"></div>
            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.2s] [animation-duration:0.8s]"></div>
            <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.4s] [animation-duration:0.8s]"></div>
        </div>
    );
}
