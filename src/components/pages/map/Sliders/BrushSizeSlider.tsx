import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { setBrushWidth } from "@store/paintSlice";
import { Slider } from "@components/widgets/Slider/Slider";

export function BrushSizeSlider() {
  const dispatch = useDispatch();
  const { brushWidth } = useSelector((state: RootState) => state.paint);

  return (
    <Slider
      min={1}
      max={21}
      step={2}
      currentValue={brushWidth}
      onChange={(value) => dispatch(setBrushWidth(value))}
      label="Size"
    />
  );
}
