"""Draw original vector explanations and export only aggregate experimental metrics.

Run with the existing competition Python environment; never load models or data rows.
The source project stays private. Generated CSVs contain allowlisted scalar metrics.
"""
import argparse
import csv
import hashlib
import html
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/kaggle'
MANIFEST = []
INK, MUTED, TEAL, GOLD, BLUE, RED = '#102b3b', '#526c79', '#087f82', '#c1831d', '#3765ad', '#b3484b'

def esc(s): return html.escape(str(s), quote=True)
def txt(x, y, value, size=22, fill=INK, weight=400, anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}">{esc(value)}</text>'
def rect(x,y,w,h,fill,stroke='none',radius=10):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def line(x1,y1,x2,y2,color=TEAL,width=3,dash=''):
    return f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}"/>'
def path(d,color=TEAL,fill='none',width=3):
    return f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>'
def circle(x,y,r,fill,stroke='none'):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def arrow(x1,y1,x2,y2,color=TEAL):
    angle=math.atan2(y2-y1,x2-x1); dx=math.cos(angle);dy=math.sin(angle)
    return line(x1,y1,x2,y2,color)+path(f'M{x2-12*dx+6*dy} {y2-12*dy-6*dx} L{x2} {y2} L{x2-12*dx-6*dy} {y2-12*dy+6*dx}',color)
def frame(title,body,w=1200,h=675,dark=False):
    bg='#102635' if dark else '#f9faf7'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{esc(title)}">
<title>{esc(title)}</title><style>text{{font-family:Arial,'PingFang SC','Noto Sans CJK SC',sans-serif}}</style>
<rect width="{w}" height="{h}" fill="{bg}"/>{body}</svg>'''

# Each subject has its own original scene; none is a photograph or an official logo.
SPECS = [
('01','TITANIC','Relational features / group validation',['Passenger relations','Fit-only label maps','Role-specific XGBoost','Group stress test'],
 ['No held-out outcomes enter a map','Ordinary CV and group stress answer different questions']),
('02','NAME THAT LLM','Semantic representations / lexical fingerprints',['Prompt-separated folds','Native 8B experts','Character + word TF-IDF','0.6 / 0.4 probability mix'],
 ['Published experts and a separately fitted lexical head','27B feasibility was tested; it is not in the submitted mix']),
('03','STORE SALES','Calendar-safe features / recursive forecasting',['Past calendar window','Fit family models','Predict day t + 1','Roll forward 16 days'],
 ['Predictions become future lag values','Four history-window forecasts use a fixed arithmetic mean']),
('04','ENGINEERING AGENT','Task environment / evaluation boundary',['Task specification','Docker task bridge','Agent tools + files','Grader reads deliverable'],
 ['Environment boundary remains unresolved','A CUDA reply is not a graded engineering task']),
('05','GEMMA CODE AGENT','Patch generation / paired confirmation',['Issue + repository','Read / patch / test','Isolated task sandbox','Paired control comparison'],
 ['Keep environment errors separate','A candidate must beat the frozen scored control']),
('06','OTTO','Candidate retrieval / target-specific ranking',['Observed session prefix','Co-visitation retrieval','Click / cart / order rankers','20 unique products'],
 ['Candidate coverage bounds attainable recall','Independent GPU tasks are not distributed tree training']),
('07','FUTURE SALES','Missing transactions / explicit zero-demand rows',['Monthly active grid','Strictly past lags','LightGBM month model','Clip forecast to 0–20'],
 ['Zero rows change the prediction population','Use a later month for confirmation, not random rows']),
('08','CIFAR-10','Transfer learning / candidate selection',['96 px images','Training augmentation','ConvNeXt + two seeds','Select / refit / predict'],
 ['ImageNet initialization; no CIFAR answer lookup','Averaging must beat the declared single-model gate']),
('09','LLM PREFERENCE','Answer symmetry / audited inference',['Prompt + response A/B','Balanced truncation','Gemma + Llama passes','Restore A/B then fuse'],
 ['The MLP classifier head is restored from the checkpoint','A swapped pass must restore the first two output columns']),
('10','SEVERSTAL','Pixel masks / crop-aligned presence',['256 × 1600 source frame','Crop + presence target','ResNet34 U-Net masks','Native geometry + calibration'],
 ['A positive full frame can produce a negative crop','Single-model thresholds do not automatically transfer to an ensemble']),
('11','GI TRACT','Adjacent slices / patient-level separation',['One patient stays together','Slices −2 / 0 / +2','2.5D EfficientNet-B4 U-Net','Native masks + organ checks'],
 ['Synthetic anatomy in this drawing; no patient images','Diagnostic pixel Dice is not hosted Dice3DHausdorff']),
('12','MUSHROOMS','Feature representation / threshold uncertainty',['70 / 10 / 10 / 10 split','XGBoost / CatBoost arms','Tune weight + threshold','Freeze then inspect audit'],
 ['The paired audit interval crosses zero','Small public/private differences do not prove a universal winner']),
('13','SF CRIME','Address structure / cross-fitted target statistics',['Whole-week partitions','Fit-only address statistics','CatBoost + target-feature XGB','80 / 20 → 39 probabilities'],
 ['Inner week folds exclude the current held-out week','The final audit is evaluated after the blend is frozen']),
('14','AERIAL CACTUS','Compact CNN / ranking and confidence',['Duplicate-aware split','CNN and residual control','Select on stopping AUC','Single CNN / frozen audit'],
 ['AUC can stay fixed while BCE decreases','Duplicate checks do not establish geographic independence']),
('15','CMI / ORDINAL','Continuous regression / ordered decisions',['Participant OOF predictions','GPU ordinal regressor','Thresholds .55 / 1.10 / 1.45','Freeze → independent audit'],
 ['Identifiers and PCIAT-derived predictors are excluded','RMSE checkpoint choice and QWK threshold choice are distinct']),
('16','COMMONLIT','Unseen prompts / two-target assessment',['Question + passage + summary','Native SentencePiece IDs','DeBERTa / summary pooling','Content and wording scores'],
 ['Each entire prompt is held out','Global OOF errors are aggregated per target before averaging']),
('17','CARVANA','Vehicle masks / full-test inference cost',['Whole-car split','Measured pilot admission','Select / audit / all-label refit','ZIP → GPU → native RLE'],
 ['Plan diagram, not proof of full training or a score','Each model probability is resized before final thresholding']),
('validation','VALIDATION DESIGN','Define the unfamiliar / protect every boundary',['Define future population','Group or time partition','Fit every transform inside it','Freeze selection before audit'],
 ['A row can be out-of-fold while selection still reuses it','Validation design is a deployment assumption']),
('metrics','READ THE METRIC','Ranking / probability / decision / geometry',['Define the scored object','Declare the stopping metric','Retain per-target diagnostics','Separate official evidence'],
 ['A flat metric is not proof of sufficient training','Different task scores are not a common quality scale']),
('compute','EXPERIMENT BUDGET','Capacity / throughput / complete delivery',['Measure representative work','Budget the critical path','Reserve refit and inference','Validate the scored artifact'],
 ['Per-device memory is not a shared pool','Upload, execution, validation and scoring are separate events']),
]

def scene(key):
    s=''; pale='#8faebd'; white='#eff5f1'; light='#67d2c3'; gold='#f2bc67'
    if key=='01':
        s+=path('M120 290 L830 290 L750 365 L235 365 Z',pale,'#1f465b',3)
        s+=rect(265,220,420,65,'#2a5364')+rect(335,168,38,52,gold)+rect(430,158,38,62,gold)
        points=[(820,145),(960,190),(840,295),(1020,305),(960,100)]
        for a,b in [(0,1),(0,2),(1,3),(1,4)]:s+=line(*points[a],*points[b],light)
        for i,(x,y) in enumerate(points):s+=circle(x,y,24,light if i<3 else gold)+txt(x,y+7,'W' if i%2==0 else 'C',18,INK,600,'middle')
        s+=txt(140,405,'SAME TICKET ≠ INDEPENDENT SAMPLES',22,pale)
    elif key=='02':
        for i,w in enumerate([290,380,225,330,270]):s+=rect(95,105+i*48,w,15,pale if i%2 else light, radius=4)
        for i,w in enumerate([130,240,190,280]):s+=rect(575,110+i*58,w,28,'#2c5265')+rect(575,110+i*58,w*.45,28,gold)
        s+=arrow(480,215,545,215,white)+txt(585,390,'semantic + lexical evidence',25,white)
        for i in range(18):s+=circle(1020+(i%3)*35,110+(i//3)*42,9,light if i%2 else gold)
    elif key in ['03','07']:
        for r in range(4):
            for c in range(9):
                s+=rect(95+c*66,100+r*59,54,46,'#264b5e',radius=4)
                if key=='07':s+=txt(122+c*66,130+r*59,'0' if (r+c)%3 else '3',21,light if (r+c)%3 else white,400,'middle')
        s+=line(695,80,695,365,gold,3,'7 7')+txt(720,88,'forecast origin',19,gold)
        for k,color in enumerate([light,gold,pale]):
            coords=[(735+i*65,280-35*math.sin(i*.9+k)-k*20) for i in range(6)]
            s+=path('M'+' L'.join(f'{x},{y:.1f}' for x,y in coords),color,width=4)
        s+=txt(100,395,'calendar time' if key=='03' else 'shop × item × month',24,white)
    elif key=='04':
        for i,label in enumerate(['TASK','CONTAINER','TOOLS','GRADER']):
            x=100+i*265;s+=rect(x,120,225,210,'#24485c',gold if i==1 else pale)
            s+=txt(x+112,210,label,23,white,600,'middle')
            if i<3:s+=arrow(x+228,225,x+260,225,light)
        s+=line(368,350,590,95,RED,6)+txt(100,400,'Environment readiness is an evaluation gate',25,pale)
    elif key=='05':
        s+=rect(100,82,610,300,'#193b4d',pale)
        for i,label in enumerate(['def solve(issue):','− ignore_edge_case()','+ check_input_shape()','+ run_focused_tests()']):
            s+=txt(135,140+i*58,label,26,RED if i==1 else light if i>1 else white)
        for x,h,n,c in [(830,180,'6',light),(960,120,'4',gold)]:
            s+=rect(x,350-h,80,h,c,radius=4)+txt(x+40,335-h,n,26,white,600,'middle')
        s+=txt(825,395,'control / candidate',21,pale)
    elif key=='06':
        p=[(160,220),(310,120),(330,300),(475,190),(520,350)]
        for a,b in [(0,1),(0,2),(1,3),(2,3),(2,4),(3,4)]:s+=line(*p[a],*p[b],pale,3)
        for i,(x,y) in enumerate(p):s+=circle(x,y,25,light if i%2 else gold)
        s+=arrow(560,240,680,240,white)
        for r,label in enumerate(['clicks','carts','orders']):
            s+=txt(735,100+r*100,label,22,white)
            for c in range(6):s+=rect(735+c*55,115+r*100,43,35,light if c<3 else '#345466',radius=5)
    elif key=='08':
        for r in range(3):
            for c in range(4):
                x=100+c*84;y=95+r*84;s+=rect(x,y,68,68,'#2a4f60',radius=4)
                s+=circle(x+34,y+34,13,[light,gold,pale][(r+c)%3])
        for i in range(5):s+=rect(580+i*75,120+i*22,42,230-i*35,[pale,light,gold,pale,light][i],radius=3)
        s+=arrow(445,220,550,220,white)+txt(575,400,'96 px → learned representation → 10 classes',23,white)
    elif key=='09':
        for x,label,col in [(100,'A',light),(560,'B',gold)]:
            s+=rect(x,100,360,220,'#244b5e',col)+txt(x+25,145,label,34,col,600)
            for j,w in enumerate([240,285,190]):s+=rect(x+25,175+j*36,w,10,pale,radius=2)
        s+=path('M300 350 Q500 445 750 350',light,width=4)+path('M320 75 Q540 10 770 75',gold,width=4)
        s+=txt(950,160,'P(A)',24,light)+txt(950,220,'P(B)',24,gold)+txt(950,280,'P(tie)',24,white)
        s+=txt(100,400,'SWAP INPUTS / RESTORE OUTPUT ORDER',23,pale)
    elif key=='10':
        s+=rect(100,135,1010,205,'#64808b',pale,radius=3)
        for x in [160,990]:s+=circle(x,370,32,'#24485a',pale)
        for d,c in [('M250 160 L280 290 L300 245 L310 310',light),('M420 245 Q500 120 530 280',gold),('M700 165 L810 185 L850 275 L735 290 Z','#6798dc')]:s+=path(d,c,width=10)
        s+=txt(115,105,'256 × 1600 / four defect classes',25,white)+txt(115,420,'pixel mask + crop-aligned presence',24,pale)
    elif key=='11':
        for i in range(3):
            x=120+i*270;y=95+i*35;s+=rect(x,y,235,245,'#24485b',pale)
            s+=f'<ellipse cx="{x+118}" cy="{y+120}" rx="86" ry="94" fill="#587889"/>'
            s+=path(f'M{x+70} {y+95} Q{x+110} {y+40} {x+155} {y+100} Q{x+200} {y+160} {x+120} {y+185} Q{x+65} {y+165} {x+70} {y+95}',[light,gold,'#7ba6ec'][i],width=9)
            s+=txt(x+118,y+225,['−2','0','+2'][i],24,white,600,'middle')
        s+=txt(970,175,'3 slices',27,white)+txt(970,225,'1 patient',27,light)+txt(970,275,'3 organs',27,gold)
    elif key=='12':
        for x,y,k in [(220,200,1),(400,270,.7),(610,165,.8)]:
            s+=path(f'M{x-70*k} {y} Q{x} {y-110*k} {x+70*k} {y} Z',light,'#24636d',3)+rect(x-15*k,y,30*k,100*k,pale)
        for a,b in [((850,110),(780,220)),((850,110),(990,220)),((990,220),(920,340)),((990,220),(1080,340))]:s+=line(*a,*b,pale)
        for x,y in [(850,110),(780,220),(990,220),(920,340),(1080,340)]:s+=circle(x,y,18,gold)
    elif key=='13':
        for i in range(8):s+=line(110+i*85,85,110+i*85,370,pale,1)
        for i in range(5):s+=line(90,95+i*64,745,95+i*64,pale,1)
        for x,y in [(210,160),(300,240),(390,180),(565,310),(650,150)]:s+=circle(x,y,12,light)+circle(x,y,27,'none',gold)
        for i,label in enumerate(['address','week','39 classes']):s+=rect(835,100+i*95,255,65,'#294b5b')+txt(860,142+i*95,label,25,white)
        s+=txt(105,425,'Illustrative grid / not crime locations',20,pale)
    elif key=='14':
        for r in range(2):
            for c in range(4):
                x=100+c*135;y=100+r*145;s+=rect(x,y,115,115,'#32564e',pale,radius=4)
                if (r+c)%3:
                    for i in range(7):
                        a=i*math.pi*2/7;s+=line(x+57,y+57,x+57+32*math.cos(a),y+57+32*math.sin(a),light,9)
                    s+=circle(x+57,y+57,17,gold)
        s+=path('M750 350 L750 100 M750 350 L1100 350 M750 350 Q780 120 1100 110',pale,width=3)
        s+=txt(825,410,'ranking ≠ calibration',24,white)
    elif key=='15':
        for i in range(4):
            x=140+i*250;y=350-i*65;s+=rect(x,y,170,90+i*15,[pale,light,gold,'#92a5ed'][i])
            s+=txt(x+85,y-20,str(i),42,white,600,'middle')
        s+=txt(125,90,'ordered severity / calibrated boundaries',27,white)
    elif key=='16':
        for i in range(3):
            x=100+i*160;s+=rect(x,85+i*20,145,260,'#2a4d5e',pale)
            for j in range(6):s+=rect(x+18,125+i*20+j*29,105-j%2*22,8,light if i==2 and j>2 else pale,radius=2)
        s+=arrow(590,230,750,230,white)
        for i,label in enumerate(['CONTENT','WORDING']):
            s+=rect(810,120+i*145,285,95,'#254d61',light if i==0 else gold)+txt(835,175+i*145,label,29,white)
        s+=txt(100,415,'question / source / student summary',23,pale)
    elif key=='17':
        s+=path('M145 280 L205 250 L300 150 Q425 105 575 160 L700 250 L885 285 L890 350 L140 350 Z',light,'#254f61',4)
        s+=path('M310 170 L255 245 L635 245 L560 170 Z',pale,'#102635',3)
        s+=circle(300,350,52,'#102635',pale)+circle(735,350,52,'#102635',pale)
        for x in range(940,1120,30):s+=line(x,100,x,380,'#406171',1)
        for y in range(100,390,30):s+=line(940,y,1120,y,'#406171',1)
        s+=txt(950,425,'native RLE',22,white)
    elif key=='validation':
        for c in range(4):
            for r in range(4):s+=rect(135+c*235,100+r*68,190,50,light if c==r else '#35586a')+txt(230+c*235,132+r*68,'HELD GROUP' if c==r else 'FIT',18,INK if c==r else white,500,'middle')
        s+=txt(135,420,'The unit you hold out defines the question you ask.',24,white)
    elif key=='metrics':
        for i,label in enumerate(['RANKING','PROBABILITY','DECISION']):
            x=90+i*360;s+=line(x,340,x,100,pale,2)+line(x,340,x+280,340,pale,2)+txt(x,405,label,22,white)
            if i==0:s+=path(f'M{x} 340 Q{x+20} 130 {x+280} 120',light,width=5)
            elif i==1:s+=path(f'M{x} 340 L{x+280} 100',gold,width=4)
            else:
                for j,h in enumerate([95,170,110,210]):s+=rect(x+20+j*60,340-h,35,h,light if j<2 else gold,radius=3)
    else:
        for x,label in [(115,'GPU 0'),(650,'GPU 1')]:
            s+=rect(x,100,430,150,'#284e61',pale)+txt(x+28,153,label,29,white)
            for j in range(5):s+=rect(x+28+j*75,185,60,30,light if j<3 else gold,radius=3)
        for j,label in enumerate(['load','fit','refit','infer','validate']):
            x=115+j*200;s+=rect(x,320,175,65,'#315566')+txt(x+87,362,label,23,white,500,'middle')
    return s

def vectors():
    for key,title,subtitle,steps,notes in SPECS:
        directory=OUT/key;directory.mkdir(parents=True,exist_ok=True)
        label=key.upper() if not key.isdigit() else f'CASE {key}'
        body=txt(75,48,'BIN / JOURNAL     ·     KAGGLE FIELD NOTES',16,'#a3bdc6',500)
        body+=txt(1125,48,label,16,'#a3bdc6',500,'end')+scene(key)
        body+=line(75,470,1125,470,'#3c5b6c',1)+txt(75,550,title,54,'#f5f7ee',700)+txt(75,605,subtitle,25,'#a6d6cd')
        cover=directory/'cover.svg';cover.write_text(frame(title+' — original subject illustration',body,dark=True))
        body=txt(55,58,title+' / METHOD MAP',29,INK,700)+txt(55,97,'Original explanation · arrows describe the protocol, not an executed trace',17,MUTED)
        positions=[(70,150),(650,150),(70,370),(650,370)]
        # Dependency arrows follow the declared protocol; multi-model detail is in the prose.
        body+=arrow(565,215,625,215)+arrow(870,292,870,345)+arrow(630,435,565,435)
        for i,(x,y) in enumerate(positions):
            step=steps[[0,1,3,2][i]]
            num=[1,2,4,3][i]
            body+=rect(x,y,470,130,'#ecf1ed','#cddad9')+circle(x+35,y+35,17,TEAL)
            body+=txt(x+35,y+42,str(num),20,'white',600,'middle')
            # Wrap English labels at spaces for mobile zoom and preserved text semantics.
            words=step.split();lines=[];current=''
            for word in words:
                if len(current+' '+word)>29:lines.append(current);current=word
                else:current=(current+' '+word).strip()
            if current:lines.append(current)
            for j,label in enumerate(lines):body+=txt(x+30,y+82+j*30,label,24,INK,600)
        body+=line(60,548,1140,548,'#cbd7d6',1)
        for i,note in enumerate(notes):body+=txt(70,590+i*32,note,19,MUTED)
        if key=='02':
            body=txt(55,58,title+' / COMPLEMENTARY REPRESENTATIONS',29,INK,700)
            body+=txt(55,97,'Two feature paths are fitted separately, then combined in probability space',17,MUTED)
            for a,b in [((530,245),(290,285)),((670,245),(910,285)),((290,417),(450,450)),((910,417),(750,450))]:body+=arrow(*a,*b)
            for i,(x,y,w) in enumerate([(390,130,420),(80,300,420),(700,300,420),(390,465,420)]):
                body+=rect(x,y,w,110,'#ecf1ed','#cddad9')
                body+=txt(x+24,y+40,f'0{i+1}',18,TEAL,600)+txt(x+24,y+78,steps[i],23,INK,600)
            for i,note in enumerate(notes):body+=txt(70,620+i*28,note,18,MUTED)
        method=directory/'method.svg';method.write_text(frame(title+' — method and validation boundaries',body))
        for p,kind in [(cover,'original_cover'),(method,'original_method_diagram')]:
            MANIFEST.append({'id':f'{key}-{kind}','file':'/kaggle/'+str(p.relative_to(OUT)),
                'kind':kind,'author':'BIN / JOURNAL','description':'Original vector illustration; no competition sample or official logo.',
                'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--source-root',type=Path,required=True)
    args=parser.parse_args();vectors();charts(args.source_root)
    (ROOT/'src/data').mkdir(exist_ok=True)
    (ROOT/'src/data/kaggle-figures.json').write_text(json.dumps(MANIFEST,ensure_ascii=False,indent=2)+'\n')
    (OUT/'figures.json').write_text(json.dumps(MANIFEST,ensure_ascii=False,indent=2)+'\n')
    print(f'Created {len(MANIFEST)} original illustrations and aggregate-evidence figures.')

# Chart exporters are defined below so the same script rebuilds all published assets.
def charts(source):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np
    plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,
        'axes.spines.right':False,'axes.titleweight':'bold','axes.labelcolor':INK,
        'text.color':INK,'axes.edgecolor':'#a6b9c0','figure.facecolor':'#f9faf7',
        'axes.facecolor':'#f9faf7','grid.alpha':.2,'svg.fonttype':'none','svg.hashsalt':'bin-kaggle-evidence-v2'})

    def read(name):
        p=source/name
        return json.loads(p.read_text()),{'path':name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    def doc(number,name):
        p=next(source.glob(f'{number:02d}_*'))/'docs'/name
        return {'path':str(p.relative_to(source)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
    def finish(key,name,fig,rows,refs,scope,notes):
        directory=OUT/key;directory.mkdir(parents=True,exist_ok=True)
        fig.text(.02,.012,'BIN / JOURNAL · Recorded observations only · '+scope,fontsize=8,color=MUTED)
        fig.tight_layout(rect=(0,.055,1,.98))
        target=directory/(name+'.svg');fig.savefig(target,metadata={'Date':None});plt.close(fig)
        target.write_text('\n'.join(line.rstrip() for line in target.read_text().splitlines())+'\n')
        data=directory/(name+'.csv');columns=list(dict.fromkeys(k for row in rows for k in row))
        with data.open('w',newline='') as stream:
            writer=csv.DictWriter(stream,columns,lineterminator='\n');writer.writeheader();writer.writerows(rows)
        MANIFEST.append({'id':f'{key}-{name}','file':'/kaggle/'+str(target.relative_to(OUT)),
            'kind':'recorded_aggregate_metrics','data':'/kaggle/'+str(data.relative_to(OUT)),
            'scope':scope,'notes':notes,'sources':refs,'rows':len(rows),'fields':columns,
            'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
            'dataSha256':hashlib.sha256(data.read_bytes()).hexdigest()})
    def points(ax,x,y,label,color):
        ax.plot(x,y,'o-',markersize=3,linewidth=1.7,label=label,color=color);ax.grid(True)
    def bars(key,name,labels,series,ylabel,refs,scope,notes):
        fig,ax=plt.subplots(figsize=(10,4.5));x=np.arange(len(labels));rows=[]
        width=.7/len(series)
        for i,(label,values,color) in enumerate(series):
            ax.bar(x+(i-(len(series)-1)/2)*width,values,width,label=label,color=color)
            if len(series)==1:
                for j,value in enumerate(values):
                    ax.annotate(str(int(value)) if float(value).is_integer() else f'{value:.6f}',
                        (x[j],value),xytext=(0,7),textcoords='offset points',ha='center',fontsize=9)
            for j,v in enumerate(values):rows.append({'candidate':labels[j],'series':label,'value':v})
        ax.set_xticks(x,labels);ax.set_ylabel(ylabel);ax.legend();ax.grid(axis='y');
        finish(key,name,fig,rows,refs,scope,notes)

    bars('01','validation', ['RF control','RF + WCG','WCG rule','WCG + XGB'],[
        ('Ordinary repeated CV',[.841751,.845866,.846988,.847737],TEAL),
        ('Relationship-group stress',[.802469,.802469,.821549,.821549],GOLD)],'Accuracy',
        [doc(1,'wcg-results.md')],'Internal validation; not official scores',
        'Three ordinary fivefold repeats versus one grouped fivefold stress protocol. Different generalization questions; no independent feature attribution.')
    bars('02','complementarity',['Lexical only','Native parent','0.6 native + 0.4 lexical'],[
        ('Development OOF balanced accuracy',[.458230,.659786,.6683047477],TEAL)],'Balanced accuracy',
        [doc(2,'overnight-t4-results.md')],'Selected development OOF; not untouched holdout',
        'The lexical model is weaker alone. Corpus selection and mixture selection reuse development information.')
    bars('03','scored-candidates',['Seasonal','Global LGB','Residual LGB','Origin blend','Family windows'],[
        ('Official public RMSLE',[.45914,.42323,.43480,.42413,.38420],TEAL)],'RMSLE (lower is better)',
        [doc(3,'final-report.md')],'Five scored packages; multiple components differ',
        'The packages change more than one component; this is not a causal ablation. Unsubmitted configurations are excluded.')
    bars('05','paired-confirmation',['Scored control','Refreshed candidate'],[
        ('Resolved tasks',[6,4],TEAL)],'Resolved task count',
        [doc(5,'refresh31b-results-20261120.md')],'24-task confirmation; not an official leaderboard score',
        'One evaluation environment error was recorded separately; counts are not a general success-rate estimate.')
    bars('06','candidate-ceiling',['Clicks','Carts','Orders'],[
        ('Selected ranker',[.50244598,.40087623,.61468722],TEAL),
        ('Candidate attainable ceiling',[.58881981,.47582538,.65880931],GOLD)],'Recall@20',
        [doc(6,'gpu-results.md')],'Internal temporal diagnostic; candidate pool fixed',
        'Ceilings apply the metric-specific per-session cap; they are not achieved model scores.')
    bars('07','month-confirmation',['Last month','Lag mean','Selected LGB'],[
        ('Month 33 confirmation RMSE',[1.13581701,1.02094007,.87443860],TEAL)],'RMSE (lower is better)',
        [doc(7,'results.md')],'Same month 33 confirmation population',
        'Month 32 selected the candidate; month 33 is a separate temporal confirmation. This is not the official test population.')

    # CIFAR: both actual full-selection histories, no inferred epochs.
    fig,axes=plt.subplots(1,2,figsize=(11,4.4));rows=[];refs=[]
    for seed,color,best in [(42,GOLD,27),(2026,TEAL,25)]:
        h,r=read(f'08_cifar_10/data/reports/remote-progress-20261123/v5/cifar-study/seed-{seed}/selection-history.json');refs.append(r)
        for e in h:rows.append({'seed':seed,'epoch':e['epoch'],'train_loss':e['train_loss'],'validation_loss':e['validation_loss'],'validation_accuracy':e['validation_accuracy']})
        points(axes[0],[e['epoch'] for e in h],[e['validation_loss'] for e in h],f'Seed {seed}: validation loss',color)
        points(axes[1],[e['epoch'] for e in h],[e['validation_accuracy'] for e in h],f'Seed {seed}',color)
        axes[1].axvline(best,color=color,linestyle='--',alpha=.6)
    axes[0].set_title('Unaugmented validation loss');axes[1].set_title('Selected epochs: 27 and 25')
    for ax in axes:ax.set_xlabel('Selection epoch');ax.legend(fontsize=8)
    axes[0].set_ylabel('Cross-entropy');axes[1].set_ylabel('Validation accuracy')
    finish('08','learning',fig,rows,refs,'v5; reused 5,000-row selection split',
        'Unsmoothed epoch observations. Dashed lines mark selected checkpoints; two-seed averaging did not pass the improvement gate.')

    h,r=read('10_severstal_steel_defect_detection/data/runs/baseline-20261120T061615Z/training-artifacts/training/fold-0/cv/history.json')
    val=[e for e in h if e.get('validation')];rows=[];fig,axes=plt.subplots(1,2,figsize=(11,4.4))
    points(axes[0],[e['epoch'] for e in h],[e['loss'] for e in h],'Augmented train loss',TEAL)
    points(axes[1],[e['epoch'] for e in val],[e['validation']['dice'] for e in val],'Mean Dice',TEAL)
    points(axes[1],[e['epoch'] for e in val],[e['validation']['always_empty_dice'] for e in val],'Always-empty reference',RED)
    for e in h:
        v=e.get('validation',{});row={'epoch':e['epoch'],'crop_width':e['width'],'train_loss':e['loss'],'validation_dice':v.get('dice'),'always_empty_dice':v.get('always_empty_dice')}
        for i,c in enumerate(v.get('per_class',[])):row[f'class_{i+1}_positive_dice']=c['positive_dice']
        rows.append(row)
    axes[0].set_title('Training loss across crop schedule');axes[1].set_title('A high empty-mask baseline')
    for ax in axes:ax.set_xlabel('Observed epoch');ax.legend(fontsize=8)
    finish('10','learning',fig,rows,[r],'Selection worker 0 / reused stopping fold',
        'Validation is logged every two epochs; no values are invented for missing epochs. Positive-only class Dice is provided in the CSV.')

    fig,axes=plt.subplots(1,2,figsize=(11,4.4));rows=[];refs=[]
    for worker,color in [(0,TEAL),(1,GOLD)]:
        h,r=read(f'11_uw_madison_gi_tract_image_segmentation/data/reports/remote-progress-20261123/v10/training/seed-{worker}/cv/history.json');refs.append(r)
        points(axes[0],[e['epoch'] for e in h],[e['validation']['validation_loss'] for e in h],f'Worker {worker}',color)
        points(axes[1],[e['epoch'] for e in h],[e['validation']['foreground_pixel_dice_mean'] for e in h],f'Worker {worker}',color)
        for e in h:rows.append({'worker':worker,'epoch':e['epoch'],'train_loss':e['loss'],'validation_loss':e['validation']['validation_loss'],'native_pixel_dice':e['validation']['foreground_pixel_dice_mean'],
            **{f'organ_{i+1}_dice':v for i,v in enumerate(e['validation']['per_organ_pixel_dice'])}})
    axes[0].set_title('Patient-held-out validation loss');axes[1].set_title('Both runs end at the 3-epoch cap')
    for ax in axes:ax.set_xlabel('Observed selection epoch');ax.set_xticks([1,2,3]);ax.legend()
    axes[1].set_ylabel('Native pixel Dice; not hosted composite')
    finish('11','learning',fig,rows,refs,'v10 / patient-separated selection / only 3 points per worker',
        'Native pixel Dice is not official Dice3DHausdorff. Lines connect observations only; cap-limited convergence remains unresolved.')
    bars('12','audit-ablation',['XGB raw','XGB rare pooled','Cat mixed','Cat all categorical'],[
        ('Frozen audit MCC at 0.5',[.984569,.984596,.984214,.983029],TEAL)],'MCC (all bars start at zero)',
        [doc(12,'results.md')],'Independent audit; four representation arms',
        'Small differences should be read numerically, not exaggerated by a truncated axis. Mixture-minus-single bootstrap spans zero.')

    fig,axes=plt.subplots(1,2,figsize=(11,4.4));rows=[];refs=[]
    for ax,candidate,best in zip(axes,['cat_address','xgb_target'],[1625,137]):
        h,r=read(f'13_sf_crime/data/runs/storage-repair-20261124T032907Z/full-outputs/sf-crime-run/selection-{candidate}/history.json');refs.append(r)
        obs=h['observations'];x=[e['iteration'] for e in obs]
        points(ax,x,[e['train_logloss'] for e in obs],'Train',TEAL);points(ax,x,[e['stop_logloss'] for e in obs],'Stop',GOLD)
        ax.axvline(best,color=RED,linestyle='--',label=f'Selected {best}')
        ax.set_title(candidate);ax.set_xlabel('Recorded iteration');ax.set_ylabel('Multiclass log loss');ax.legend(fontsize=8)
        rows += [{'candidate':candidate,'iteration':e['iteration'],'train_logloss':e['train_logloss'],'stop_logloss':e['stop_logloss']} for e in obs]
    finish('13','learning',fig,rows,refs,'v6 / 25-round log samples plus selected and final observations',
        'Dashed lines show selected rounds. Sampling is disclosed; no unlogged validation values are reconstructed.')

    h,r=read('14_aerial_cactus_identification/data/runs/experiment-20261123T125142Z/outputs/cactus-run/selection-small_cnn/history.json')
    obs=h['epochs'];fig,axes=plt.subplots(1,2,figsize=(11,4.4));x=[e['epoch'] for e in obs]
    points(axes[0],x,[e['train_loss'] for e in obs],'Augmented train BCE',TEAL);points(axes[0],x,[e['validation_loss'] for e in obs],'Clean stop BCE',GOLD)
    axes[0].set_yscale('log');points(axes[1],x,[e['validation_auc'] for e in obs],'Stopping AUC',TEAL)
    for ax in axes:ax.axvline(27,color=RED,linestyle='--',label='Selected epoch 27');ax.set_xlabel('Epoch');ax.legend(fontsize=8)
    axes[0].set_title('BCE still decreases after selection');axes[1].set_title('AUC plateaus at 1.0')
    rows=[{k:e[k] for k in ['epoch','train_loss','validation_loss','validation_auc']} for e in obs]
    finish('14','learning',fig,rows,[r],'v1 small CNN / 37 observed epochs',
        'Train and stopping losses have different augmentation contexts. Logarithmic loss axis; no smoothing; reused stopping split.')

    h,r=read('15_child_mind_institute_problematic_internet_use/data/runs/scoring-20261125T061759Z/full/outputs/cmi-piu-run/selection-xgb/fold-1/history.json')
    obs=h['observations'];fig,axes=plt.subplots(1,2,figsize=(11,4.4));x=[e['iteration'] for e in obs]
    points(axes[0],x,[e['train_rmse'] for e in obs],'Train RMSE',TEAL);points(axes[0],x,[e['stop_rmse'] for e in obs],'Stop RMSE',GOLD)
    points(axes[1],x,[e['stop_fixed_qwk'] for e in obs],'Fixed-threshold QWK',TEAL)
    for ax in axes:ax.axvline(108,color=RED,linestyle='--',label='RMSE-selected 108');ax.set_xlabel('Recorded iteration');ax.legend(fontsize=8)
    axes[0].set_title('Checkpoint selection follows RMSE');axes[1].set_title('Fixed-threshold QWK can move differently')
    rows=[{k:e[k] for k in ['iteration','train_rmse','stop_rmse','stop_fixed_qwk']} for e in obs]
    finish('15','learning',fig,rows,[r],'v2 / XGBoost fold 1 / sampled observations',
        'QWK is evaluated with fixed thresholds here; it is not the calibrated OOF or official QWK. No unlogged elapsed values are filled.')
    a,r=read('15_child_mind_institute_problematic_internet_use/data/runs/scoring-20261125T061759Z/full/outputs/cmi-piu-run/audit.json')
    m=np.array(a['confusion_matrix']);fig,ax=plt.subplots(figsize=(7.5,5));ax.imshow(m,cmap='Blues',vmin=0)
    for i in range(4):
        for j in range(4):ax.text(j,i,str(m[i,j]),ha='center',va='center',color='white' if m[i,j]>m.max()/2 else INK,fontsize=15)
    ax.set_xticks(range(4));ax.set_yticks(range(4));ax.set_xlabel('Predicted class');ax.set_ylabel('True class');ax.set_title('Frozen audit: 548 participants; class 3 support = 7')
    rows=[{'true_class':i,'predicted_class':j,'count':int(m[i,j])} for i in range(4) for j in range(4)]
    finish('15','confusion',fig,rows,[r],'Counts only / no participant rows or identifiers',
        'No class-3 participant was correctly predicted in this audit. Small support limits stable class-specific inference.')

    fig,axes=plt.subplots(2,2,figsize=(11,7));rows=[];refs=[]
    for col,(folder,label,best) in enumerate([('cv-worker-0--fold-0','Prompt fold 0',1),('cv-worker-1--fold-1','Prompt fold 1',5)]):
        h,r=read(f'16_commonlit_evaluate_student_summaries/data/reports/full-v3-curve-review/{folder}/history.json');refs.append(r);obs=h['epochs'];x=[e['epoch'] for e in obs]
        points(axes[0,col],x,[e['train_mse'] for e in obs],'Train MSE',TEAL)
        points(axes[0,col],x,[e['validation']['mse'] for e in obs],'Validation MSE',GOLD)
        for key,color in [('content_rmse',TEAL),('wording_rmse',GOLD)]:points(axes[1,col],x,[e['validation'][key] for e in obs],key,color)
        for ax in axes[:,col]:ax.axvline(best,color=RED,linestyle='--');ax.set_xlabel('Observed epoch');ax.legend(fontsize=8)
        axes[0,col].set_title(label+f' / selected epoch {best}')
        for e in obs:rows.append({'fold':col,'epoch':e['epoch'],'train_mse':e['train_mse'],**{k:e['validation'][k] for k in ['mse','mcrmse','content_rmse','wording_rmse']}})
    finish('16','learning',fig,rows,refs,'v3 / two complete prompt-held-out selection histories',
        'Targets can move in opposite directions. Fold 1 reaches its six-epoch cap; these are reused selection observations, not official scores.')

    pilot,receipt=read('17_carvana_image_masking_challenge/data/runs/authorized-20261125T112203Z/pilot/outputs/carvana-run/result.json')
    b=pilot['parallel_benchmark']
    bars('17','pilot-timing',['One T4','Two T4 workers'],[
        ('Wall seconds / same 512 images',[b['single_gpu_wall_seconds'],b['dual_gpu_wall_seconds']],TEAL)],'Seconds (lower is better)',
        [receipt],'Remote pilot report / one positive-weight model / includes startup',
        'Observed speedup is about 1.58, not a full-workflow or two-model ensemble guarantee. Local artifact validation stopped at the CSV field-size limit; no official score is implied.')

if __name__ == '__main__': main()
