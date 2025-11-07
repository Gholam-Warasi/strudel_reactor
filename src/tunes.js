export const jazzlike = `setcps(<tempo_control>/60/4)
// Based on the style of Felix Roos (CC BY-NC-SA 4.0)
await samples('github:tidalcycles/Dirt-Samples/master/')
const pattern = <drum_pattern_control>

/* DRUMS */
<mute_drums>drums:
stack(
  s("bd").struct(pick(["x ~ x ~","x*2 ~ x ~ x*2 ~ ~","{x ~!3 x x ~ x!2 x ~}%8"], pattern)).postgain(2).pdec(1).pcurve(2).gain(<gain_drums> * <master_volume_control>).log("drums:<gain_drums>"),
  s("sn").struct("{~ s ~ s}%4").postgain(1).lpf(8000).gain(<gain_drums> * <master_volume_control>),
  s("hh").struct("x*16").postgain(0.6).jux(rev).room(<reverb_control>).gain(<gain_drums> * <master_volume_control>)
).gain(1)
<mute_drums>

// BASS
<mute_bass>bassline:
note(pick(["<eb1 eb2 eb3 eb2>/8","<f2 f3 f2 f1>/8"], <bassline_control>))
.sound("sawtooth")
.cutoff(400)
.resonance(0.7)
.legato(0.5)
.gain(<gain_bass> * <master_volume_control>)
.room(<reverb_control>)
.log("bass:<gain_bass>")
<mute_bass>

// CHORDS
<mute_chords>chords:
note("<[c3,eb3,g3] [f3,ab3,c4] [g3,bb3,d4] [eb3,g3,bb3]>")
.sound("sawtooth")
.cutoff(800)
.resonance(0.3)
.legato(0.8)
.gain(<gain_chords> * <master_volume_control>)
.room(<reverb_control>)
.log("chords:<gain_chords>")
<mute_chords>

// LEAD / MELODY
<mute_lead>lead:
note(pick(["~ e5 ~ ~ ~ c5 ~ d5","~ e6 ~ ~ c6 ~ d6 ~"], <arpeggiator_control>))
.sound("triangle")
.decay(0.25)
.sustain(0.12)
.gain(<gain_lead> * <master_volume_control>)
.delay(<delay_send_control>)
.delaytime(0.375)
.delayfeedback(0.45)
.room(<reverb_control>)
.log("lead:<gain_lead>")
<mute_lead>

// Optional second drum layer (toggled by show_drums2)
drums2:
stack(
  "[bd ~ ~ ~] [~ ~ ~ ~] [bd ~ ~ ~] [~ ~ ~ ~] ",
  "[hh ~ hh hh] [hh ~ hh ~] [hh ~ hh ~] [hh ~ hh ~] ",
  "[~ ~ ~ ~] [~ ~ ~ ~] [~ ~ ~ ~] [lt ~ lt ~] ",
  "[~ ~ ~ ~] [~ ~ ~ ~] [~ ~ mt ~] [~ ~ ~ ~] ",
  "[~ ~ ~ rim] [~ ~ rim ~] [~ ~ ~ ~] [~ ~ ~ ~] ",
).s().slow(2)


// crossfade helper comment (injected by preprocessor): crossfader applies between (drums+bass) and (chords+lead)
`;