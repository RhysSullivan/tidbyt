import { NextPage } from "next";
import { Animated } from "../components/capture";

const ExamplePage: NextPage = () => {
    return <div
        style={{
            width: (64 * 6),
            height: (32 * 6),
        }}
        id='capture-container'
    >
        <Animated />
    </div>;
};

export default ExamplePage;