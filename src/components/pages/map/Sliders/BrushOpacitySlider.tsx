import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { setBrushOpacity } from "@store/slices/paintSlice";
import { Slider } from "@components/widgets/Slider/Slider";

export function BrushOpacitySlider() {
  const dispatch = useDispatch();
  const { opacity } = useSelector((state: RootState) => state.paint);

  return (
    <Slider
      max={1}
      step={0.01}
      currentValue={opacity}
      onChange={(value) => dispatch(setBrushOpacity(value))}
      label="Opacity"
    />
  );
}
