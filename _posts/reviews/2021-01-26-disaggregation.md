---
title: "Disaggregation and the Application"
author: Hyunjoon Jeong
layout: post
category: review
---

본 리뷰는 HotCloud'20에 게재되었던 "Disaggregation and the Application" 논문을 읽고 내용을 간단히 정리하고자 쓰였습니다.
(틀린 내용이나 잘못 이해하고 있는 부분이 있다면 지적 부탁 드리겠습니다.)

본 논문은 application의 관점에서 본 Disaggregated data center architecture에 대해 설명하고, 어떠한 문제점들이 해결되어야 하는지에 대해 쓰였습니다. 우선 Disaggregation은 기존의 monolithic 서버들을 빠른 interconnection을 이용해 단일의 resource pool로 만드는 것을 의미합니다. 즉, 기존의 클러스터 구성이 서버 중심이였다면, Disaggregation을 통한 클러스터는 자원 중심으로 구성이 되는 것입니다. 따라서 프로세서나 메모리 같은 각각의 자원들은 필요시 각 resource pool에서 할당이 되고, 이를 이용해 logical server를 구성하는 것도 가능합니다.  

저자는 이러한 DDC(Disaggregated Data Center)가 기존의 연구에 따르면 주로 bin-packing 문제를 해결하여 자원의 활용률을 해결하는등의 operational benefit에 초점이 맞추어져 있고, 이러한 방향은 암묵적으로 OS의 관점에서 프로세서와 메모리의 분산 특징이 application으로부터 추상화가 이루어져야 한다는 것입니다. 따라서 논문에서 주장하는 것은 단순히 Disaggregation이 기존의 application을 지원하기 위해 사용되어야 하는 하드웨어 트렌드라는 것뿐만 아니라 application 입장에서도 이용되어야 한다는 것입니다.  

이러한 제안을 통해 저자는 아래와 같은 기존의 분산 공유 메모리 시스템에서 영감을 받았다고 밝히며 DDC의 하드웨어에서 application의 지원에 이익이 될 수 있는 두 가지 특성을 이야기 합니다.

1. 프로세서와 메모리 사이의 매핑을 동적으로 재구성하여 메모리를 재할당 하는 능력
2. 서로 다른 하드웨어 구성 요소의 failure 독립성

먼저 메모리 재할당은 메모리를 다시 매핑하여 네트워크를 통해 대량으로 데이터를 전송하는 것을 필요로 하는 applicatiob에서 활용됩니다. 또는 프로세서에서 오류가 발생했을 경우, 메모리를 다시 새로운 타깃으로 찾는 등 zero-copy 작업을 수행하는 특성을 말합니다. failure 독립성의 경우, 메모리 failure가 발생했을 시 빠르고 신뢰할 수 있는 알림을 보내주고 복구 프로토콜을 실행함으로써 프로세서에게 유용한 기능을 제공하는 것을 의미합니다.

수정중...

\[논문 출처 및 그림] <a href="https://www.usenix.org/conference/hotcloud20/presentation/angel">Disaggregation and the Application</a>. Sebastian Angel, Mihir Nanavati, Siddhartha Sen. HotCloud'20.
