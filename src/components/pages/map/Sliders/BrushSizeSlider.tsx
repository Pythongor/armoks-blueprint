import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { setBrushSize } from "@store/brushSlice";
import { Slider } from "@components/widgets/Slider/Slider";

export function BrushSizeSlider() {
  const dispatch = useDispatch();
  const { brushSize } = useSelector((state: RootState) => state.brush);

  return (
    <Slider
      min={1}
      max={21}
      step={2}
      currentValue={brushSize}
      onChange={(value) => dispatch(setBrushSize(value))}
      label="Brush Size"
    />
  );
}
